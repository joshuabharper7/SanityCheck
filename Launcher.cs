using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;

public class SanityCheckLauncher {
    public static void Main() {
        try {
            string currentDir = AppDomain.CurrentDomain.BaseDirectory;
            string batFile = Path.Combine(currentDir, "Start-SanityCheck.bat");

            if (!File.Exists(batFile)) {
                MessageBox.Show("Could not find Start-SanityCheck.bat in " + currentDir, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = "cmd.exe";
            psi.Arguments = "/c \"" + batFile + "\"";
            psi.WorkingDirectory = currentDir;
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true; // Launch the batch logic silently, let it open its own window as needed

            Process.Start(psi);
        } catch (Exception ex) {
            MessageBox.Show("Launch failed: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
