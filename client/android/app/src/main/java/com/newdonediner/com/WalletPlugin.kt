package com.newdonediner.com

import android.content.Context
import android.content.SharedPreferences
import android.net.Uri
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

import com.solana.mobilewalletadapter.clientlib.ActivityResultSender
import com.solana.mobilewalletadapter.clientlib.ConnectionIdentity
import com.solana.mobilewalletadapter.clientlib.MobileWalletAdapter
import com.solana.mobilewalletadapter.clientlib.RpcCluster
import com.solana.mobilewalletadapter.clientlib.TransactionResult
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.delay
import androidx.activity.ComponentActivity

@CapacitorPlugin(name = "WalletPlugin")
class WalletPlugin : Plugin() {

    private val PREFS_NAME = "WalletCachePrefs"
    private val KEY_ADDRESS = "saved_address"
    
    // 【关键点1】：把办事员提出来，做成类成员
    private lateinit var sender: ActivityResultSender

    // 【关键点2】：在插件加载时（还没启动完成前）立刻初始化它
    override fun load() {
        super.load()
        val currentActivity = activity as? ComponentActivity ?: return
        sender = ActivityResultSender(currentActivity)
    }

    private fun getPrefs(): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    @PluginMethod
    fun authorize(call: PluginCall) {
        val dname = call.getString("name", "斗地主") ?: "斗地主"
        val identityUri = call.getString("identityUri", "https://solana.com") ?: "https://solana.com"
        val iconUri = call.getString("iconUri", "favicon.ico") ?: "favicon.ico"
        val clusterStr = call.getString("cluster", "mainnet-beta") ?: "mainnet-beta"

        val clusterEnum = when (clusterStr) {
            "devnet" -> RpcCluster.Devnet
            "testnet" -> RpcCluster.Testnet
            else -> RpcCluster.MainnetBeta
        }

        // 此时不需要再创建 ActivityResultSender 了，直接用已经初始化好的 sender
        CoroutineScope(Dispatchers.Main).launch {
            try {
                val connectionIdentity = ConnectionIdentity(
                    identityUri = Uri.parse(identityUri),
                    iconUri = Uri.parse(iconUri),
                    identityName = dname
                )
                
                val mwa = MobileWalletAdapter(connectionIdentity = connectionIdentity)
                delay(300)
                val result = mwa.transact(sender) { // 直接使用类里的 sender
                    authorize(
                        identityUri = Uri.parse(identityUri),
                        iconUri = Uri.parse(iconUri),
                        identityName = dname,
                        rpcCluster = clusterEnum
                    )
                }

                if (result is TransactionResult.Success) {
                    val pubKeyBytes = result.payload.publicKey
                    val addressBase58 = encodeBase58(pubKeyBytes)
                    val data = JSObject()

                    data.put("address", addressBase58)
                    notifyListeners("wallet_cache_ready", data)

                    call.resolve()
                } else {
                    call.reject("钱包操作未完成")
                }
            } catch (e: Exception) {
                // 这一次，这里绝对不会再报 Lifecycle 错误了
                call.reject("原生层错误: ${e.message ?: e.toString()}")
            }
        }
    }

    @PluginMethod
    fun checkNativeCache(call: PluginCall) {
        val savedAddress = getPrefs().getString(KEY_ADDRESS, null)
        val ret = JSObject()
        
        if (!savedAddress.isNullOrEmpty()) {
            ret.put("address", savedAddress)
        }
        
        call.resolve(ret)
    }

    @PluginMethod
    fun clearNativeCache(call: PluginCall) {
        getPrefs().edit().remove(KEY_ADDRESS).apply()
        call.resolve()
    }

    private fun encodeBase58(input: ByteArray): String {
        val alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz".toCharArray()
        if (input.isEmpty()) return ""
        var zeros = 0
        while (zeros < input.size && input[zeros].toInt() == 0) ++zeros
        val b58 = ByteArray(input.size * 2)
        var length = 0
        for (i in zeros until input.size) {
            var carry = input[i].toInt() and 0xFF
            var idx = 0
            for (j in b58.indices.reversed()) {
                if (carry == 0 && idx >= length) break
                carry += 256 * (b58[j].toInt() and 0xFF)
                b58[j] = (carry % 58).toByte()
                carry /= 58
                idx++
            }
            length = idx
        }
        var idx = 0
        while (idx < b58.size && b58[idx].toInt() == 0) ++idx
        val str = java.lang.StringBuilder()
        while (zeros-- > 0) str.append('1')
        while (idx < b58.size) str.append(alphabet[b58[idx++].toInt() and 0xFF])
        return str.toString()
    }
}