with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

# Fix key_name to a valid value
content = content.replace(
    "      formData.append('key_name', 'chat_attachments');",
    "      formData.append('key_name', 'order_photos');"
)

# Fix URL extraction to match the actual backend response format: { data: { url, full_url } }
old_url_line = "      const fileUrl = uploadJson.file_url ?? uploadJson.data?.file_url ?? uploadJson.data?.full_url ?? uploadJson.data?.url ?? uploadJson.full_url ?? uploadJson.url ?? '';"
new_url_line = "      const fileUrl = (uploadJson.data?.full_url || uploadJson.data?.url || uploadJson.file_url || uploadJson.data?.file_url || uploadJson.full_url || uploadJson.url || '');"
content = content.replace(old_url_line, new_url_line)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
print("Done")
