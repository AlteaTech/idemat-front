using System.Security.Cryptography;
using System.Text;
using System.IO;
using System;

public class Crypto : IDisposable
    {
        private static byte[] iv = Encoding.UTF8.GetBytes("InterTek"); //Vecteur d'initialisation : 8 caractères
        private static byte[] key = Encoding.UTF8.GetBytes("1234567890ABCDEFGHIJKLMN"); //Clé : 24 caractères

        private static TripleDESCryptoServiceProvider encrypteur = new TripleDESCryptoServiceProvider();

        public static string Crypte(string valeur)
        {
            string res = "";
            try
            {
                ICryptoTransform transform;
                MemoryStream myStream;
                CryptoStream cs;
                byte[] data;

                transform = encrypteur.CreateEncryptor(key, iv);

                data = Encoding.UTF8.GetBytes(valeur);

                myStream = new MemoryStream();
                cs = new CryptoStream(myStream, transform, CryptoStreamMode.Write);
                cs.Write(data, 0, data.Length);
                cs.FlushFinalBlock();

                cs.Close();

                res = Convert.ToBase64String(myStream.ToArray());

            }
            catch (Exception ex)
            {

            }

            return res;
        }

        public static string Decrypte(string valeur)
        {
            string res = "";
            try
            {
                ICryptoTransform transform;
                MemoryStream myStream;
                CryptoStream cs;
                byte[] data;

                transform = encrypteur.CreateDecryptor(key, iv);

                data = Convert.FromBase64String(valeur);

                myStream = new MemoryStream(data);
                cs = new CryptoStream(myStream, transform, CryptoStreamMode.Read);
                byte[] dataDecode = new byte[data.Length];

                int decryptedByteCount;
                decryptedByteCount = cs.Read(dataDecode, 0, dataDecode.Length);

                myStream.Close();
                cs.Close();

                res = Encoding.UTF8.GetString(dataDecode, 0, decryptedByteCount);

            }
            catch (Exception ex)
            {

            }

            return res;
        }

        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }

public class generationPwd : IDisposable
{
    private static int GetRandomInt()
    {
        var randomBytes = new byte[4];
        RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
        rng.GetBytes(randomBytes);
        int randomInt = BitConverter.ToInt32(randomBytes, 0);
        return randomInt;
    }

    public static string GenerePwd()
    {
        try
        {
            string possibleChars = "ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789!@#$%^&*";
            char[] cpossibleChars;
            cpossibleChars = possibleChars.ToCharArray();

            StringBuilder builder = new StringBuilder();

            for (int i = 0; i < 12; i++) //Mot de passe 12 caractères
            {
                int randInt32 = GetRandomInt();
                var r = new Random(randInt32);

                int nextInt = r.Next(cpossibleChars.Length);
                char c = cpossibleChars[nextInt];
                builder.Append(c);
            }
            return builder.ToString();
        }
        catch (Exception ex)
        {
            return ex.Message;
        }
    }
        
    public void Dispose()
    {
        throw new NotImplementedException();
    }
}