import fs from 'fs';
import path from 'path';

export async function saveAccountToEnv(email: string, password: string) {
    // Determine current environment from process.env.ENV or .env
    const currentEnv = process.env.ENV || 'staging1';
    const envFileName = `.env.${currentEnv}`;
    const envPath = path.join(process.cwd(), envFileName);

    console.log(`💾 Saving account credentials to: ${envFileName}`);

    // Check if the file exists
    if (!fs.existsSync(envPath)) {
        throw new Error(`Environment file not found: ${envPath}. Please create ${envFileName} first.`);
    }

    // Read the current file
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update or add values
    const emailPattern = /^CLIENT_EMAIL_NEW_REGISTERED=.*$/m;
    const passwordPattern = /^CLIENT_PASSWORD_NEW_REGISTERED=.*$/m;

    if (emailPattern.test(envContent)) {
        envContent = envContent.replace(emailPattern, `CLIENT_EMAIL_NEW_REGISTERED=${email}`);
    } else {
        envContent += `\nCLIENT_EMAIL_NEW_REGISTERED=${email}`;
    }

    if (passwordPattern.test(envContent)) {
        envContent = envContent.replace(passwordPattern, `CLIENT_PASSWORD_NEW_REGISTERED=${password}`);
    } else {
        envContent += `\nCLIENT_PASSWORD_NEW_REGISTERED=${password}`;
    }

    // Salvează fișierul
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ Credentials saved successfully to ${envFileName}`);
}