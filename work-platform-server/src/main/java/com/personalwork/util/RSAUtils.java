package com.personalwork.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.binary.Base64;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import javax.crypto.Cipher;
import java.security.*;

@Slf4j
public class RSAUtils {
    private static final KeyPair KEY_PAIR = initKey();

    private static KeyPair initKey() {
        try {
            Provider provider = new BouncyCastleProvider();
            Security.addProvider(provider);
            SecureRandom random = new SecureRandom();
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA", provider);
            generator.initialize(1024, random);
            return generator.generateKeyPair();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static String generateBase64PublicKey() {
        PublicKey publicKey = KEY_PAIR.getPublic();
        return new String(Base64.encodeBase64(publicKey.getEncoded()));
    }

    public static String decryptBase64(String string) {
        return new String(decrypt(Base64.decodeBase64(string.getBytes())));
    }

    private static byte[] decrypt(byte[] byteArray) {
        try {
            Provider provider = new BouncyCastleProvider();
            Security.addProvider(provider);
            Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding", provider);
            PrivateKey privateKey = KEY_PAIR.getPrivate();
            cipher.init(Cipher.DECRYPT_MODE, privateKey);
            return cipher.doFinal(byteArray);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
