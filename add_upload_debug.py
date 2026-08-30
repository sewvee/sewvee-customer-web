with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

old = """      const uploadRes = await fetch(URL_UPLOAD, {
        method: 'POST',
        headers: { Authorization: formattedToken },
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(`Upload failed`);"""

new = """      const uploadRes = await fetch(URL_UPLOAD, {
        method: 'POST',
        headers: { Authorization: formattedToken },
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      console.log('[UPLOAD] Response:', uploadRes.status, JSON.stringify(uploadJson));
      if (!uploadRes.ok) throw new Error(`Upload failed: ${JSON.stringify(uploadJson)}`);"""

content = content.replace(old, new)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
print("Done")
