// node_modules/@solana/wallet-standard-util/lib/esm/signIn.js
var DOMAIN = "(?<domain>[^\\n]+?) wants you to sign in with your Solana account:\\n";
var ADDRESS = "(?<address>[^\\n]+)(?:\\n|$)";
var STATEMENT = "(?:\\n(?<statement>[\\S\\s]*?)(?:\\n|$))??";
var URI = "(?:\\nURI: (?<uri>[^\\n]+))?";
var VERSION = "(?:\\nVersion: (?<version>[^\\n]+))?";
var CHAIN_ID = "(?:\\nChain ID: (?<chainId>[^\\n]+))?";
var NONCE = "(?:\\nNonce: (?<nonce>[^\\n]+))?";
var ISSUED_AT = "(?:\\nIssued At: (?<issuedAt>[^\\n]+))?";
var EXPIRATION_TIME = "(?:\\nExpiration Time: (?<expirationTime>[^\\n]+))?";
var NOT_BEFORE = "(?:\\nNot Before: (?<notBefore>[^\\n]+))?";
var REQUEST_ID = "(?:\\nRequest ID: (?<requestId>[^\\n]+))?";
var RESOURCES = "(?:\\nResources:(?<resources>(?:\\n- [^\\n]+)*))?";
var FIELDS = `${URI}${VERSION}${CHAIN_ID}${NONCE}${ISSUED_AT}${EXPIRATION_TIME}${NOT_BEFORE}${REQUEST_ID}${RESOURCES}`;
var MESSAGE = new RegExp(`^${DOMAIN}${ADDRESS}${STATEMENT}${FIELDS}\\n*$`);
function createSignInMessageText(input) {
  let message = `${input.domain} wants you to sign in with your Solana account:
`;
  message += `${input.address}`;
  if (input.statement) {
    message += `

${input.statement}`;
  }
  const fields = [];
  if (input.uri) {
    fields.push(`URI: ${input.uri}`);
  }
  if (input.version) {
    fields.push(`Version: ${input.version}`);
  }
  if (input.chainId) {
    fields.push(`Chain ID: ${input.chainId}`);
  }
  if (input.nonce) {
    fields.push(`Nonce: ${input.nonce}`);
  }
  if (input.issuedAt) {
    fields.push(`Issued At: ${input.issuedAt}`);
  }
  if (input.expirationTime) {
    fields.push(`Expiration Time: ${input.expirationTime}`);
  }
  if (input.notBefore) {
    fields.push(`Not Before: ${input.notBefore}`);
  }
  if (input.requestId) {
    fields.push(`Request ID: ${input.requestId}`);
  }
  if (input.resources) {
    fields.push(`Resources:`);
    for (const resource of input.resources) {
      fields.push(`- ${resource}`);
    }
  }
  if (fields.length) {
    message += `

${fields.join("\n")}`;
  }
  return message;
}

// node_modules/@solana/codecs-core/dist/index.browser.mjs
function createDecoder(decoder) {
  return Object.freeze({
    ...decoder,
    decode: (bytes, offset = 0) => decoder.read(bytes, offset)[0]
  });
}

// node_modules/@solana/codecs-strings/dist/index.browser.mjs
var getBaseXDecoder = (alphabet4) => {
  return createDecoder({
    read(rawBytes, offset) {
      const bytes = offset === 0 ? rawBytes : rawBytes.slice(offset);
      if (bytes.length === 0) return ["", 0];
      let trailIndex = bytes.findIndex((n) => n !== 0);
      trailIndex = trailIndex === -1 ? bytes.length : trailIndex;
      const leadingZeroes = alphabet4[0].repeat(trailIndex);
      if (trailIndex === bytes.length) return [leadingZeroes, rawBytes.length];
      const base10Number = bytes.slice(trailIndex).reduce((sum, byte) => sum * 256n + BigInt(byte), 0n);
      const tailChars = getBaseXFromBigInt(base10Number, alphabet4);
      return [leadingZeroes + tailChars, rawBytes.length];
    }
  });
};
function getBaseXFromBigInt(value, alphabet4) {
  const base = BigInt(alphabet4.length);
  const tailChars = [];
  while (value > 0n) {
    tailChars.unshift(alphabet4[Number(value % base)]);
    value /= base;
  }
  return tailChars.join("");
}
var alphabet2 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var getBase58Decoder = () => getBaseXDecoder(alphabet2);
var e = globalThis.TextDecoder;
var o = globalThis.TextEncoder;

// node_modules/@solana-mobile/mobile-wallet-adapter-protocol/lib/esm/index.browser.js
var SolanaMobileWalletAdapterErrorCode = {
  ERROR_ASSOCIATION_PORT_OUT_OF_RANGE: "ERROR_ASSOCIATION_PORT_OUT_OF_RANGE",
  ERROR_REFLECTOR_ID_OUT_OF_RANGE: "ERROR_REFLECTOR_ID_OUT_OF_RANGE",
  ERROR_FORBIDDEN_WALLET_BASE_URL: "ERROR_FORBIDDEN_WALLET_BASE_URL",
  ERROR_SECURE_CONTEXT_REQUIRED: "ERROR_SECURE_CONTEXT_REQUIRED",
  ERROR_SESSION_CLOSED: "ERROR_SESSION_CLOSED",
  ERROR_SESSION_TIMEOUT: "ERROR_SESSION_TIMEOUT",
  ERROR_WALLET_NOT_FOUND: "ERROR_WALLET_NOT_FOUND",
  ERROR_INVALID_PROTOCOL_VERSION: "ERROR_INVALID_PROTOCOL_VERSION",
  ERROR_BROWSER_NOT_SUPPORTED: "ERROR_BROWSER_NOT_SUPPORTED"
};
var SolanaMobileWalletAdapterError = class extends Error {
  constructor(...args) {
    const [code, message, data] = args;
    super(message);
    this.code = code;
    this.data = data;
    this.name = "SolanaMobileWalletAdapterError";
  }
};
var SolanaMobileWalletAdapterProtocolErrorCode = {
  // Keep these in sync with `mobilewalletadapter/common/ProtocolContract.java`.
  ERROR_AUTHORIZATION_FAILED: -1,
  ERROR_INVALID_PAYLOADS: -2,
  ERROR_NOT_SIGNED: -3,
  ERROR_NOT_SUBMITTED: -4,
  ERROR_TOO_MANY_PAYLOADS: -5,
  ERROR_ATTEST_ORIGIN_ANDROID: -100
};
var SolanaMobileWalletAdapterProtocolError = class extends Error {
  constructor(...args) {
    const [jsonRpcMessageId, code, message, data] = args;
    super(message);
    this.code = code;
    this.data = data;
    this.jsonRpcMessageId = jsonRpcMessageId;
    this.name = "SolanaMobileWalletAdapterProtocolError";
  }
};
function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}
function encode(input) {
  return window.btoa(input);
}
function fromUint8Array$1(byteArray, urlsafe) {
  const base64 = window.btoa(String.fromCharCode.call(null, ...byteArray));
  if (urlsafe) {
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } else
    return base64;
}
function toUint8Array(base64EncodedByteArray) {
  return new Uint8Array(window.atob(base64EncodedByteArray).split("").map((c) => c.charCodeAt(0)));
}
function createHelloReq(ecdhPublicKey, associationKeypairPrivateKey) {
  return __awaiter(this, void 0, void 0, function* () {
    const publicKeyBuffer = yield crypto.subtle.exportKey("raw", ecdhPublicKey);
    const signatureBuffer = yield crypto.subtle.sign({ hash: "SHA-256", name: "ECDSA" }, associationKeypairPrivateKey, publicKeyBuffer);
    const response = new Uint8Array(publicKeyBuffer.byteLength + signatureBuffer.byteLength);
    response.set(new Uint8Array(publicKeyBuffer), 0);
    response.set(new Uint8Array(signatureBuffer), publicKeyBuffer.byteLength);
    return response;
  });
}
function createSIWSMessage(payload) {
  return createSignInMessageText(payload);
}
function createSIWSMessageBase64Url(payload) {
  return encode(createSIWSMessage(payload)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
var SolanaSignTransactions = "solana:signTransactions";
var SolanaCloneAuthorization = "solana:cloneAuthorization";
var SolanaSignInWithSolana = "solana:signInWithSolana";
function fromUint8Array(byteArray) {
  return getBase58Decoder().decode(byteArray);
}
function base64ToBase58(base64EncodedString) {
  return fromUint8Array(toUint8Array(base64EncodedString));
}
function createMobileWalletProxy(protocolVersion, protocolRequestHandler) {
  return new Proxy({}, {
    get(target, p) {
      if (p === "then") {
        return null;
      }
      if (target[p] == null) {
        target[p] = function(inputParams) {
          return __awaiter(this, void 0, void 0, function* () {
            const { method, params } = handleMobileWalletRequest(p, inputParams, protocolVersion);
            const result = yield protocolRequestHandler(method, params);
            if (method === "authorize" && params.sign_in_payload && !result.sign_in_result) {
              result["sign_in_result"] = yield signInFallback(params.sign_in_payload, result, protocolRequestHandler);
            }
            return handleMobileWalletResponse(p, result, protocolVersion);
          });
        };
      }
      return target[p];
    },
    defineProperty() {
      return false;
    },
    deleteProperty() {
      return false;
    }
  });
}
function handleMobileWalletRequest(methodName, methodParams, protocolVersion) {
  let params = methodParams;
  let method = methodName.toString().replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).toLowerCase();
  switch (methodName) {
    case "authorize": {
      let { chain } = params;
      if (protocolVersion === "legacy") {
        switch (chain) {
          case "solana:testnet": {
            chain = "testnet";
            break;
          }
          case "solana:devnet": {
            chain = "devnet";
            break;
          }
          case "solana:mainnet": {
            chain = "mainnet-beta";
            break;
          }
          default: {
            chain = params.cluster;
          }
        }
        params.cluster = chain;
      } else {
        switch (chain) {
          case "testnet":
          case "devnet": {
            chain = `solana:${chain}`;
            break;
          }
          case "mainnet-beta": {
            chain = "solana:mainnet";
            break;
          }
        }
        params.chain = chain;
      }
    }
    case "reauthorize": {
      const { auth_token, identity } = params;
      if (auth_token) {
        switch (protocolVersion) {
          case "legacy": {
            method = "reauthorize";
            params = { auth_token, identity };
            break;
          }
          default: {
            method = "authorize";
            break;
          }
        }
      }
      break;
    }
  }
  return { method, params };
}
function handleMobileWalletResponse(method, response, protocolVersion) {
  switch (method) {
    case "getCapabilities": {
      const capabilities = response;
      switch (protocolVersion) {
        case "legacy": {
          const features = [SolanaSignTransactions];
          if (capabilities.supports_clone_authorization === true) {
            features.push(SolanaCloneAuthorization);
          }
          return Object.assign(Object.assign({}, capabilities), { features });
        }
        case "v1": {
          return Object.assign(Object.assign({}, capabilities), { supports_sign_and_send_transactions: true, supports_clone_authorization: capabilities.features.includes(SolanaCloneAuthorization) });
        }
      }
    }
  }
  return response;
}
function signInFallback(signInPayload, authorizationResult, protocolRequestHandler) {
  var _a;
  return __awaiter(this, void 0, void 0, function* () {
    const domain = (_a = signInPayload.domain) !== null && _a !== void 0 ? _a : window.location.host;
    const address = authorizationResult.accounts[0].address;
    const siwsMessage = createSIWSMessageBase64Url(Object.assign(Object.assign({}, signInPayload), { domain, address: base64ToBase58(address) }));
    const signMessageResult = yield protocolRequestHandler("sign_messages", {
      addresses: [address],
      payloads: [siwsMessage]
    });
    const signedPayload = toUint8Array(signMessageResult.signed_payloads[0]);
    const signedMessage = fromUint8Array$1(signedPayload.slice(0, signedPayload.length - 64));
    const signature = fromUint8Array$1(signedPayload.slice(signedPayload.length - 64));
    const signInResult = {
      address,
      // Workaround: some wallets have been observed to only reply with the message signature.
      // This is non-compliant with the spec, but in the interest of maximizing compatibility,
      // detect this case and reuse the original message.
      signed_message: signedMessage.length == 0 ? siwsMessage : signedMessage,
      signature
    };
    return signInResult;
  });
}
var SEQUENCE_NUMBER_BYTES = 4;
function createSequenceNumberVector(sequenceNumber) {
  if (sequenceNumber >= 4294967296) {
    throw new Error("Outbound sequence number overflow. The maximum sequence number is 32-bytes.");
  }
  const byteArray = new ArrayBuffer(SEQUENCE_NUMBER_BYTES);
  const view = new DataView(byteArray);
  view.setUint32(
    0,
    sequenceNumber,
    /* littleEndian */
    false
  );
  return new Uint8Array(byteArray);
}
var INITIALIZATION_VECTOR_BYTES = 12;
var ENCODED_PUBLIC_KEY_LENGTH_BYTES = 65;
function encryptMessage(plaintext, sequenceNumber, sharedSecret) {
  return __awaiter(this, void 0, void 0, function* () {
    const sequenceNumberVector = createSequenceNumberVector(sequenceNumber);
    const initializationVector = new Uint8Array(INITIALIZATION_VECTOR_BYTES);
    crypto.getRandomValues(initializationVector);
    const ciphertext = yield crypto.subtle.encrypt(getAlgorithmParams(sequenceNumberVector, initializationVector), sharedSecret, new TextEncoder().encode(plaintext));
    const response = new Uint8Array(sequenceNumberVector.byteLength + initializationVector.byteLength + ciphertext.byteLength);
    response.set(new Uint8Array(sequenceNumberVector), 0);
    response.set(new Uint8Array(initializationVector), sequenceNumberVector.byteLength);
    response.set(new Uint8Array(ciphertext), sequenceNumberVector.byteLength + initializationVector.byteLength);
    return response;
  });
}
function decryptMessage(message, sharedSecret) {
  return __awaiter(this, void 0, void 0, function* () {
    const sequenceNumberVector = message.slice(0, SEQUENCE_NUMBER_BYTES);
    const initializationVector = message.slice(SEQUENCE_NUMBER_BYTES, SEQUENCE_NUMBER_BYTES + INITIALIZATION_VECTOR_BYTES);
    const ciphertext = message.slice(SEQUENCE_NUMBER_BYTES + INITIALIZATION_VECTOR_BYTES);
    const plaintextBuffer = yield crypto.subtle.decrypt(getAlgorithmParams(sequenceNumberVector, initializationVector), sharedSecret, ciphertext);
    const plaintext = getUtf8Decoder().decode(plaintextBuffer);
    return plaintext;
  });
}
function getAlgorithmParams(sequenceNumber, initializationVector) {
  return {
    additionalData: sequenceNumber,
    iv: initializationVector,
    name: "AES-GCM",
    tagLength: 128
    // 16 byte tag => 128 bits
  };
}
var _utf8Decoder;
function getUtf8Decoder() {
  if (_utf8Decoder === void 0) {
    _utf8Decoder = new TextDecoder("utf-8");
  }
  return _utf8Decoder;
}
function generateAssociationKeypair() {
  return __awaiter(this, void 0, void 0, function* () {
    return yield crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256"
      },
      false,
      ["sign"]
      /* keyUsages */
    );
  });
}
function generateECDHKeypair() {
  return __awaiter(this, void 0, void 0, function* () {
    return yield crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256"
      },
      false,
      ["deriveKey", "deriveBits"]
      /* keyUsages */
    );
  });
}
function arrayBufferToBase64String(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let ii = 0; ii < len; ii++) {
    binary += String.fromCharCode(bytes[ii]);
  }
  return window.btoa(binary);
}
function getRandomAssociationPort() {
  return assertAssociationPort(49152 + Math.floor(Math.random() * (65535 - 49152 + 1)));
}
function assertAssociationPort(port) {
  if (port < 49152 || port > 65535) {
    throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_ASSOCIATION_PORT_OUT_OF_RANGE, `Association port number must be between 49152 and 65535. ${port} given.`, { port });
  }
  return port;
}
function getStringWithURLUnsafeCharactersReplaced(unsafeBase64EncodedString) {
  return unsafeBase64EncodedString.replace(/[/+=]/g, (m) => ({
    "/": "_",
    "+": "-",
    "=": "."
  })[m]);
}
var INTENT_NAME = "solana-wallet";
function getPathParts(pathString) {
  return pathString.replace(/(^\/+|\/+$)/g, "").split("/");
}
function getIntentURL(methodPathname, intentUrlBase) {
  let baseUrl = null;
  if (intentUrlBase) {
    try {
      baseUrl = new URL(intentUrlBase);
    } catch (_a) {
    }
    if ((baseUrl === null || baseUrl === void 0 ? void 0 : baseUrl.protocol) !== "https:") {
      throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_FORBIDDEN_WALLET_BASE_URL, "Base URLs supplied by wallets must be valid `https` URLs");
    }
  }
  baseUrl || (baseUrl = new URL(`${INTENT_NAME}:/`));
  const pathname = methodPathname.startsWith("/") ? (
    // Method is an absolute path. Replace it wholesale.
    methodPathname
  ) : (
    // Method is a relative path. Merge it with the existing one.
    [...getPathParts(baseUrl.pathname), ...getPathParts(methodPathname)].join("/")
  );
  return new URL(pathname, baseUrl);
}
function getAssociateAndroidIntentURL(associationPublicKey, putativePort, associationURLBase, protocolVersions = ["v1"]) {
  return __awaiter(this, void 0, void 0, function* () {
    const associationPort = assertAssociationPort(putativePort);
    const exportedKey = yield crypto.subtle.exportKey("raw", associationPublicKey);
    const encodedKey = arrayBufferToBase64String(exportedKey);
    const url = getIntentURL("v1/associate/local", associationURLBase);
    url.searchParams.set("association", getStringWithURLUnsafeCharactersReplaced(encodedKey));
    url.searchParams.set("port", `${associationPort}`);
    protocolVersions.forEach((version) => {
      url.searchParams.set("v", version);
    });
    return url;
  });
}
function getRemoteAssociateAndroidIntentURL(associationPublicKey, hostAuthority, reflectorId, associationURLBase, protocolVersions = ["v1"]) {
  return __awaiter(this, void 0, void 0, function* () {
    const exportedKey = yield crypto.subtle.exportKey("raw", associationPublicKey);
    const encodedKey = arrayBufferToBase64String(exportedKey);
    const url = getIntentURL("v1/associate/remote", associationURLBase);
    url.searchParams.set("association", getStringWithURLUnsafeCharactersReplaced(encodedKey));
    url.searchParams.set("reflector", `${hostAuthority}`);
    url.searchParams.set("id", `${fromUint8Array$1(reflectorId, true)}`);
    protocolVersions.forEach((version) => {
      url.searchParams.set("v", version);
    });
    return url;
  });
}
function encryptJsonRpcMessage(jsonRpcMessage, sharedSecret) {
  return __awaiter(this, void 0, void 0, function* () {
    const plaintext = JSON.stringify(jsonRpcMessage);
    const sequenceNumber = jsonRpcMessage.id;
    return encryptMessage(plaintext, sequenceNumber, sharedSecret);
  });
}
function decryptJsonRpcMessage(message, sharedSecret) {
  return __awaiter(this, void 0, void 0, function* () {
    const plaintext = yield decryptMessage(message, sharedSecret);
    const jsonRpcMessage = JSON.parse(plaintext);
    if (Object.hasOwnProperty.call(jsonRpcMessage, "error")) {
      throw new SolanaMobileWalletAdapterProtocolError(jsonRpcMessage.id, jsonRpcMessage.error.code, jsonRpcMessage.error.message);
    }
    return jsonRpcMessage;
  });
}
function parseHelloRsp(payloadBuffer, associationPublicKey, ecdhPrivateKey) {
  return __awaiter(this, void 0, void 0, function* () {
    const [associationPublicKeyBuffer, walletPublicKey] = yield Promise.all([
      crypto.subtle.exportKey("raw", associationPublicKey),
      crypto.subtle.importKey(
        "raw",
        payloadBuffer.slice(0, ENCODED_PUBLIC_KEY_LENGTH_BYTES),
        { name: "ECDH", namedCurve: "P-256" },
        false,
        []
        /* keyUsages */
      )
    ]);
    const sharedSecret = yield crypto.subtle.deriveBits({ name: "ECDH", public: walletPublicKey }, ecdhPrivateKey, 256);
    const ecdhSecretKey = yield crypto.subtle.importKey(
      "raw",
      sharedSecret,
      "HKDF",
      false,
      ["deriveKey"]
      /* keyUsages */
    );
    const aesKeyMaterialVal = yield crypto.subtle.deriveKey({
      name: "HKDF",
      hash: "SHA-256",
      salt: new Uint8Array(associationPublicKeyBuffer),
      info: new Uint8Array()
    }, ecdhSecretKey, { name: "AES-GCM", length: 128 }, false, ["encrypt", "decrypt"]);
    return aesKeyMaterialVal;
  });
}
function parseSessionProps(message, sharedSecret) {
  return __awaiter(this, void 0, void 0, function* () {
    const plaintext = yield decryptMessage(message, sharedSecret);
    const jsonProperties = JSON.parse(plaintext);
    let protocolVersion = "legacy";
    if (Object.hasOwnProperty.call(jsonProperties, "v")) {
      switch (jsonProperties.v) {
        case 1:
        case "1":
        case "v1":
          protocolVersion = "v1";
          break;
        case "legacy":
          protocolVersion = "legacy";
          break;
        default:
          throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_INVALID_PROTOCOL_VERSION, `Unknown/unsupported protocol version: ${jsonProperties.v}`);
      }
    }
    return {
      protocol_version: protocolVersion
    };
  });
}
var Browser = {
  Firefox: 0,
  Other: 1
};
function assertUnreachable(x) {
  return x;
}
function getBrowser() {
  return navigator.userAgent.indexOf("Firefox/") !== -1 ? Browser.Firefox : Browser.Other;
}
function getDetectionPromise() {
  return new Promise((resolve, reject) => {
    function cleanup() {
      clearTimeout(timeoutId);
      window.removeEventListener("blur", handleBlur);
    }
    function handleBlur() {
      cleanup();
      resolve();
    }
    window.addEventListener("blur", handleBlur);
    const timeoutId = setTimeout(() => {
      cleanup();
      reject();
    }, 3e3);
  });
}
var _frame = null;
function launchUrlThroughHiddenFrame(url) {
  if (_frame == null) {
    _frame = document.createElement("iframe");
    _frame.style.display = "none";
    document.body.appendChild(_frame);
  }
  _frame.contentWindow.location.href = url.toString();
}
function launchAssociation(associationUrl) {
  return __awaiter(this, void 0, void 0, function* () {
    if (associationUrl.protocol === "https:") {
      window.location.assign(associationUrl);
    } else {
      try {
        const browser = getBrowser();
        switch (browser) {
          case Browser.Firefox:
            launchUrlThroughHiddenFrame(associationUrl);
            break;
          case Browser.Other: {
            const detectionPromise = getDetectionPromise();
            window.location.assign(associationUrl);
            yield detectionPromise;
            break;
          }
          default:
            assertUnreachable(browser);
        }
      } catch (e2) {
        throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_WALLET_NOT_FOUND, "Found no installed wallet that supports the mobile wallet protocol.");
      }
    }
  });
}
function startSession(associationPublicKey, associationURLBase) {
  return __awaiter(this, void 0, void 0, function* () {
    const randomAssociationPort = getRandomAssociationPort();
    const associationUrl = yield getAssociateAndroidIntentURL(associationPublicKey, randomAssociationPort, associationURLBase);
    yield launchAssociation(associationUrl);
    return randomAssociationPort;
  });
}
var WEBSOCKET_CONNECTION_CONFIG = {
  /**
   * 300 milliseconds is a generally accepted threshold for what someone
   * would consider an acceptable response time for a user interface
   * after having performed a low-attention tapping task. We set the initial
   * interval at which we wait for the wallet to set up the websocket at
   * half this, as per the Nyquist frequency, with a progressive backoff
   * sequence from there. The total wait time is 30s, which allows for the
   * user to be presented with a disambiguation dialog, select a wallet, and
   * for the wallet app to subsequently start.
   */
  retryDelayScheduleMs: [150, 150, 200, 500, 500, 750, 750, 1e3],
  timeoutMs: 3e4
};
var WEBSOCKET_PROTOCOL_BINARY = "com.solana.mobilewalletadapter.v1";
var WEBSOCKET_PROTOCOL_BASE64 = "com.solana.mobilewalletadapter.v1.base64";
function assertSecureContext() {
  if (typeof window === "undefined" || window.isSecureContext !== true) {
    throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SECURE_CONTEXT_REQUIRED, "The mobile wallet adapter protocol must be used in a secure context (`https`).");
  }
}
function assertSecureEndpointSpecificURI(walletUriBase) {
  let url;
  try {
    url = new URL(walletUriBase);
  } catch (_a) {
    throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_FORBIDDEN_WALLET_BASE_URL, "Invalid base URL supplied by wallet");
  }
  if (url.protocol !== "https:") {
    throw new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_FORBIDDEN_WALLET_BASE_URL, "Base URLs supplied by wallets must be valid `https` URLs");
  }
}
function getSequenceNumberFromByteArray(byteArray) {
  const view = new DataView(byteArray);
  return view.getUint32(
    0,
    /* littleEndian */
    false
  );
}
function decodeVarLong(byteArray) {
  var bytes = new Uint8Array(byteArray), l = byteArray.byteLength, limit = 10, value = 0, offset = 0, b;
  do {
    if (offset >= l || offset > limit)
      throw new RangeError("Failed to decode varint");
    b = bytes[offset++];
    value |= (b & 127) << 7 * offset;
  } while (b >= 128);
  return { value, offset };
}
function getReflectorIdFromByteArray(byteArray) {
  let { value: length, offset } = decodeVarLong(byteArray);
  return new Uint8Array(byteArray.slice(offset, offset + length));
}
function transact(callback, config) {
  return __awaiter(this, void 0, void 0, function* () {
    assertSecureContext();
    const associationKeypair = yield generateAssociationKeypair();
    const sessionPort = yield startSession(associationKeypair.publicKey, config === null || config === void 0 ? void 0 : config.baseUri);
    const websocketURL = `ws://localhost:${sessionPort}/solana-wallet`;
    let connectionStartTime;
    const getNextRetryDelayMs = (() => {
      const schedule = [...WEBSOCKET_CONNECTION_CONFIG.retryDelayScheduleMs];
      return () => schedule.length > 1 ? schedule.shift() : schedule[0];
    })();
    let nextJsonRpcMessageId = 1;
    let lastKnownInboundSequenceNumber = 0;
    let state = { __type: "disconnected" };
    return new Promise((resolve, reject) => {
      let socket;
      const jsonRpcResponsePromises = {};
      const handleOpen = () => __awaiter(this, void 0, void 0, function* () {
        if (state.__type !== "connecting") {
          console.warn(`Expected adapter state to be \`connecting\` at the moment the websocket opens. Got \`${state.__type}\`.`);
          return;
        }
        socket.removeEventListener("open", handleOpen);
        const { associationKeypair: associationKeypair2 } = state;
        const ecdhKeypair = yield generateECDHKeypair();
        socket.send(yield createHelloReq(ecdhKeypair.publicKey, associationKeypair2.privateKey));
        state = {
          __type: "hello_req_sent",
          associationPublicKey: associationKeypair2.publicKey,
          ecdhPrivateKey: ecdhKeypair.privateKey
        };
      });
      const handleClose = (evt) => {
        if (evt.wasClean) {
          state = { __type: "disconnected" };
        } else {
          reject(new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SESSION_CLOSED, `The wallet session dropped unexpectedly (${evt.code}: ${evt.reason}).`, { closeEvent: evt }));
        }
        disposeSocket();
      };
      const handleError = (_evt) => __awaiter(this, void 0, void 0, function* () {
        disposeSocket();
        if (Date.now() - connectionStartTime >= WEBSOCKET_CONNECTION_CONFIG.timeoutMs) {
          reject(new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SESSION_TIMEOUT, `Failed to connect to the wallet websocket at ${websocketURL}.`));
        } else {
          yield new Promise((resolve2) => {
            const retryDelayMs = getNextRetryDelayMs();
            retryWaitTimeoutId = window.setTimeout(resolve2, retryDelayMs);
          });
          attemptSocketConnection();
        }
      });
      const handleMessage = (evt) => __awaiter(this, void 0, void 0, function* () {
        const responseBuffer = yield evt.data.arrayBuffer();
        switch (state.__type) {
          case "connecting":
            if (responseBuffer.byteLength !== 0) {
              throw new Error("Encountered unexpected message while connecting");
            }
            const ecdhKeypair = yield generateECDHKeypair();
            socket.send(yield createHelloReq(ecdhKeypair.publicKey, associationKeypair.privateKey));
            state = {
              __type: "hello_req_sent",
              associationPublicKey: associationKeypair.publicKey,
              ecdhPrivateKey: ecdhKeypair.privateKey
            };
            break;
          case "connected":
            try {
              const sequenceNumberVector = responseBuffer.slice(0, SEQUENCE_NUMBER_BYTES);
              const sequenceNumber = getSequenceNumberFromByteArray(sequenceNumberVector);
              if (sequenceNumber !== lastKnownInboundSequenceNumber + 1) {
                throw new Error("Encrypted message has invalid sequence number");
              }
              lastKnownInboundSequenceNumber = sequenceNumber;
              const jsonRpcMessage = yield decryptJsonRpcMessage(responseBuffer, state.sharedSecret);
              const responsePromise = jsonRpcResponsePromises[jsonRpcMessage.id];
              delete jsonRpcResponsePromises[jsonRpcMessage.id];
              responsePromise.resolve(jsonRpcMessage.result);
            } catch (e2) {
              if (e2 instanceof SolanaMobileWalletAdapterProtocolError) {
                const responsePromise = jsonRpcResponsePromises[e2.jsonRpcMessageId];
                delete jsonRpcResponsePromises[e2.jsonRpcMessageId];
                responsePromise.reject(e2);
              } else {
                throw e2;
              }
            }
            break;
          case "hello_req_sent": {
            if (responseBuffer.byteLength === 0) {
              const ecdhKeypair2 = yield generateECDHKeypair();
              socket.send(yield createHelloReq(ecdhKeypair2.publicKey, associationKeypair.privateKey));
              state = {
                __type: "hello_req_sent",
                associationPublicKey: associationKeypair.publicKey,
                ecdhPrivateKey: ecdhKeypair2.privateKey
              };
              break;
            }
            const sharedSecret = yield parseHelloRsp(responseBuffer, state.associationPublicKey, state.ecdhPrivateKey);
            const sessionPropertiesBuffer = responseBuffer.slice(ENCODED_PUBLIC_KEY_LENGTH_BYTES);
            const sessionProperties = sessionPropertiesBuffer.byteLength !== 0 ? yield (() => __awaiter(this, void 0, void 0, function* () {
              const sequenceNumberVector = sessionPropertiesBuffer.slice(0, SEQUENCE_NUMBER_BYTES);
              const sequenceNumber = getSequenceNumberFromByteArray(sequenceNumberVector);
              if (sequenceNumber !== lastKnownInboundSequenceNumber + 1) {
                throw new Error("Encrypted message has invalid sequence number");
              }
              lastKnownInboundSequenceNumber = sequenceNumber;
              return parseSessionProps(sessionPropertiesBuffer, sharedSecret);
            }))() : { protocol_version: "legacy" };
            state = { __type: "connected", sharedSecret, sessionProperties };
            const wallet = createMobileWalletProxy(sessionProperties.protocol_version, (method, params) => __awaiter(this, void 0, void 0, function* () {
              const id = nextJsonRpcMessageId++;
              socket.send(yield encryptJsonRpcMessage({
                id,
                jsonrpc: "2.0",
                method,
                params: params !== null && params !== void 0 ? params : {}
              }, sharedSecret));
              return new Promise((resolve2, reject2) => {
                jsonRpcResponsePromises[id] = {
                  resolve(result) {
                    switch (method) {
                      case "authorize":
                      case "reauthorize": {
                        const { wallet_uri_base } = result;
                        if (wallet_uri_base != null) {
                          try {
                            assertSecureEndpointSpecificURI(wallet_uri_base);
                          } catch (e2) {
                            reject2(e2);
                            return;
                          }
                        }
                        break;
                      }
                    }
                    resolve2(result);
                  },
                  reject: reject2
                };
              });
            }));
            try {
              resolve(yield callback(wallet));
            } catch (e2) {
              reject(e2);
            } finally {
              disposeSocket();
              socket.close();
            }
            break;
          }
        }
      });
      let disposeSocket;
      let retryWaitTimeoutId;
      const attemptSocketConnection = () => {
        if (disposeSocket) {
          disposeSocket();
        }
        state = { __type: "connecting", associationKeypair };
        if (connectionStartTime === void 0) {
          connectionStartTime = Date.now();
        }
        socket = new WebSocket(websocketURL, [WEBSOCKET_PROTOCOL_BINARY]);
        socket.addEventListener("open", handleOpen);
        socket.addEventListener("close", handleClose);
        socket.addEventListener("error", handleError);
        socket.addEventListener("message", handleMessage);
        disposeSocket = () => {
          window.clearTimeout(retryWaitTimeoutId);
          socket.removeEventListener("open", handleOpen);
          socket.removeEventListener("close", handleClose);
          socket.removeEventListener("error", handleError);
          socket.removeEventListener("message", handleMessage);
        };
      };
      attemptSocketConnection();
    });
  });
}
function startRemoteScenario(config) {
  return __awaiter(this, void 0, void 0, function* () {
    assertSecureContext();
    const associationKeypair = yield generateAssociationKeypair();
    const websocketURL = `wss://${config === null || config === void 0 ? void 0 : config.remoteHostAuthority}/reflect`;
    let connectionStartTime;
    const getNextRetryDelayMs = (() => {
      const schedule = [...WEBSOCKET_CONNECTION_CONFIG.retryDelayScheduleMs];
      return () => schedule.length > 1 ? schedule.shift() : schedule[0];
    })();
    let nextJsonRpcMessageId = 1;
    let lastKnownInboundSequenceNumber = 0;
    let encoding;
    let state = { __type: "disconnected" };
    let socket;
    let disposeSocket;
    let decodeBytes = (evt) => __awaiter(this, void 0, void 0, function* () {
      if (encoding == "base64") {
        const message = yield evt.data;
        return toUint8Array(message).buffer;
      } else {
        return yield evt.data.arrayBuffer();
      }
    });
    const associationUrl = yield new Promise((resolve, reject) => {
      const handleOpen = () => __awaiter(this, void 0, void 0, function* () {
        if (state.__type !== "connecting") {
          console.warn(`Expected adapter state to be \`connecting\` at the moment the websocket opens. Got \`${state.__type}\`.`);
          return;
        }
        if (socket.protocol.includes(WEBSOCKET_PROTOCOL_BASE64)) {
          encoding = "base64";
        } else {
          encoding = "binary";
        }
        socket.removeEventListener("open", handleOpen);
      });
      const handleClose2 = (evt) => {
        if (evt.wasClean) {
          state = { __type: "disconnected" };
        } else {
          reject(new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SESSION_CLOSED, `The wallet session dropped unexpectedly (${evt.code}: ${evt.reason}).`, { closeEvent: evt }));
        }
        disposeSocket();
      };
      const handleError = (_evt) => __awaiter(this, void 0, void 0, function* () {
        disposeSocket();
        if (Date.now() - connectionStartTime >= WEBSOCKET_CONNECTION_CONFIG.timeoutMs) {
          reject(new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SESSION_TIMEOUT, `Failed to connect to the wallet websocket at ${websocketURL}.`));
        } else {
          yield new Promise((resolve2) => {
            const retryDelayMs = getNextRetryDelayMs();
            retryWaitTimeoutId = window.setTimeout(resolve2, retryDelayMs);
          });
          attemptSocketConnection();
        }
      });
      const handleReflectorIdMessage = (evt) => __awaiter(this, void 0, void 0, function* () {
        const responseBuffer = yield decodeBytes(evt);
        if (state.__type === "connecting") {
          if (responseBuffer.byteLength == 0) {
            throw new Error("Encountered unexpected message while connecting");
          }
          const reflectorId = getReflectorIdFromByteArray(responseBuffer);
          state = {
            __type: "reflector_id_received",
            reflectorId
          };
          const associationUrl2 = yield getRemoteAssociateAndroidIntentURL(associationKeypair.publicKey, config.remoteHostAuthority, reflectorId, config === null || config === void 0 ? void 0 : config.baseUri);
          socket.removeEventListener("message", handleReflectorIdMessage);
          resolve(associationUrl2);
        }
      });
      let retryWaitTimeoutId;
      const attemptSocketConnection = () => {
        if (disposeSocket) {
          disposeSocket();
        }
        state = { __type: "connecting", associationKeypair };
        if (connectionStartTime === void 0) {
          connectionStartTime = Date.now();
        }
        socket = new WebSocket(websocketURL, [WEBSOCKET_PROTOCOL_BINARY, WEBSOCKET_PROTOCOL_BASE64]);
        socket.addEventListener("open", handleOpen);
        socket.addEventListener("close", handleClose2);
        socket.addEventListener("error", handleError);
        socket.addEventListener("message", handleReflectorIdMessage);
        disposeSocket = () => {
          window.clearTimeout(retryWaitTimeoutId);
          socket.removeEventListener("open", handleOpen);
          socket.removeEventListener("close", handleClose2);
          socket.removeEventListener("error", handleError);
          socket.removeEventListener("message", handleReflectorIdMessage);
        };
      };
      attemptSocketConnection();
    });
    let sessionEstablished = false;
    let handleClose;
    return { associationUrl, close: () => {
      socket.close();
      handleClose();
    }, wallet: new Promise((resolve, reject) => {
      const jsonRpcResponsePromises = {};
      const handleMessage = (evt) => __awaiter(this, void 0, void 0, function* () {
        const responseBuffer = yield decodeBytes(evt);
        switch (state.__type) {
          case "reflector_id_received":
            if (responseBuffer.byteLength !== 0) {
              throw new Error("Encountered unexpected message while awaiting reflection");
            }
            const ecdhKeypair = yield generateECDHKeypair();
            const binaryMsg = yield createHelloReq(ecdhKeypair.publicKey, associationKeypair.privateKey);
            if (encoding == "base64") {
              socket.send(fromUint8Array$1(binaryMsg));
            } else {
              socket.send(binaryMsg);
            }
            state = {
              __type: "hello_req_sent",
              associationPublicKey: associationKeypair.publicKey,
              ecdhPrivateKey: ecdhKeypair.privateKey
            };
            break;
          case "connected":
            try {
              const sequenceNumberVector = responseBuffer.slice(0, SEQUENCE_NUMBER_BYTES);
              const sequenceNumber = getSequenceNumberFromByteArray(sequenceNumberVector);
              if (sequenceNumber !== lastKnownInboundSequenceNumber + 1) {
                throw new Error("Encrypted message has invalid sequence number");
              }
              lastKnownInboundSequenceNumber = sequenceNumber;
              const jsonRpcMessage = yield decryptJsonRpcMessage(responseBuffer, state.sharedSecret);
              const responsePromise = jsonRpcResponsePromises[jsonRpcMessage.id];
              delete jsonRpcResponsePromises[jsonRpcMessage.id];
              responsePromise.resolve(jsonRpcMessage.result);
            } catch (e2) {
              if (e2 instanceof SolanaMobileWalletAdapterProtocolError) {
                const responsePromise = jsonRpcResponsePromises[e2.jsonRpcMessageId];
                delete jsonRpcResponsePromises[e2.jsonRpcMessageId];
                responsePromise.reject(e2);
              } else {
                throw e2;
              }
            }
            break;
          case "hello_req_sent": {
            const sharedSecret = yield parseHelloRsp(responseBuffer, state.associationPublicKey, state.ecdhPrivateKey);
            const sessionPropertiesBuffer = responseBuffer.slice(ENCODED_PUBLIC_KEY_LENGTH_BYTES);
            const sessionProperties = sessionPropertiesBuffer.byteLength !== 0 ? yield (() => __awaiter(this, void 0, void 0, function* () {
              const sequenceNumberVector = sessionPropertiesBuffer.slice(0, SEQUENCE_NUMBER_BYTES);
              const sequenceNumber = getSequenceNumberFromByteArray(sequenceNumberVector);
              if (sequenceNumber !== lastKnownInboundSequenceNumber + 1) {
                throw new Error("Encrypted message has invalid sequence number");
              }
              lastKnownInboundSequenceNumber = sequenceNumber;
              return parseSessionProps(sessionPropertiesBuffer, sharedSecret);
            }))() : { protocol_version: "legacy" };
            state = { __type: "connected", sharedSecret, sessionProperties };
            const wallet = createMobileWalletProxy(sessionProperties.protocol_version, (method, params) => __awaiter(this, void 0, void 0, function* () {
              const id = nextJsonRpcMessageId++;
              const binaryMsg2 = yield encryptJsonRpcMessage({
                id,
                jsonrpc: "2.0",
                method,
                params: params !== null && params !== void 0 ? params : {}
              }, sharedSecret);
              if (encoding == "base64") {
                socket.send(fromUint8Array$1(binaryMsg2));
              } else {
                socket.send(binaryMsg2);
              }
              return new Promise((resolve2, reject2) => {
                jsonRpcResponsePromises[id] = {
                  resolve(result) {
                    switch (method) {
                      case "authorize":
                      case "reauthorize": {
                        const { wallet_uri_base } = result;
                        if (wallet_uri_base != null) {
                          try {
                            assertSecureEndpointSpecificURI(wallet_uri_base);
                          } catch (e2) {
                            reject2(e2);
                            return;
                          }
                        }
                        break;
                      }
                    }
                    resolve2(result);
                  },
                  reject: reject2
                };
              });
            }));
            sessionEstablished = true;
            try {
              resolve(wallet);
            } catch (e2) {
              reject(e2);
            }
            break;
          }
        }
      });
      socket.addEventListener("message", handleMessage);
      handleClose = () => {
        socket.removeEventListener("message", handleMessage);
        disposeSocket();
        if (!sessionEstablished) {
          reject(new SolanaMobileWalletAdapterError(SolanaMobileWalletAdapterErrorCode.ERROR_SESSION_CLOSED, `The wallet session was closed before connection.`, { closeEvent: new CloseEvent("socket was closed before connection") }));
        }
      };
    }) };
  });
}
export {
  SolanaCloneAuthorization,
  SolanaMobileWalletAdapterError,
  SolanaMobileWalletAdapterErrorCode,
  SolanaMobileWalletAdapterProtocolError,
  SolanaMobileWalletAdapterProtocolErrorCode,
  SolanaSignInWithSolana,
  SolanaSignTransactions,
  startRemoteScenario,
  transact
};
