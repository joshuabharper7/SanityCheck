using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

public class IconConverter {
    public static void Main(string[] args) {
        if (args.Length < 2) return;
        string pngPath = args[0];
        string icoPath = args[1];

        using (Bitmap bitmap = (Bitmap)Image.FromFile(pngPath)) {
            // Resize to 256x256 if needed
            Bitmap resized = new Bitmap(bitmap, new Size(256, 256));
            using (MemoryStream ms = new MemoryStream()) {
                resized.Save(ms, ImageFormat.Png);
                byte[] pngData = ms.ToArray();

                using (BinaryWriter writer = new BinaryWriter(File.Open(icoPath, FileMode.Create))) {
                    // ICONDIR
                    writer.Write((short)0);           // Reserved
                    writer.Write((short)1);           // Type (1 = Icon)
                    writer.Write((short)1);           // Count

                    // ICONDIRENTRY
                    writer.Write((byte)0);            // Width (0 = 256)
                    writer.Write((byte)0);            // Height (0 = 256)
                    writer.Write((byte)0);            // Color count
                    writer.Write((byte)0);            // Reserved
                    writer.Write((short)1);           // Planes
                    writer.Write((short)32);          // Bit depth
                    writer.Write(pngData.Length);     // Size of image data
                    writer.Write(22);                 // Offset to image data (6 for header + 16 for entry)

                    // Image data (PNG format is valid in modern ICO files)
                    writer.Write(pngData);
                }
            }
        }
    }
}
