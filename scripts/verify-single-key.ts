
const apiKey = "AIzaSyBUXevJaFAi6VbeB1RSVTlRWlTfMEf-3yc"; // Test LAST key

async function verifySingleKey() {
    console.log('--- Verificando Única API Key ---');
    console.log(`Key: ${apiKey.substring(0, 10)}...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ Valid Key! Available Models:`);
            console.log(data.models?.map((m: any) => m.name).join('\n'));
        } else {
            const data = await response.json().catch(() => ({}));
            console.log(`❌ Error: (${response.status} - ${data.error?.message || 'Error'})`);
        }
    } catch (e: any) {
        console.log(`❌ Error: (${e.message})`);
    }
}

verifySingleKey();
