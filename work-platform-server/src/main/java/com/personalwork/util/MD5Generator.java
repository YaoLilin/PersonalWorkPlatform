package com.personalwork.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MD5Generator {

    /**
     * 生成给定字符串的 MD5 哈希值。
     *
     * @param input 要进行哈希处理的字符串。
     * @return 32 位小写的 MD5 哈希值。
     */
    public static String generateMD5(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] messageDigest = md.digest(input.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : messageDigest) {
                String hex = Integer.toHexString(0xFF & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
