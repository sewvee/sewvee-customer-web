import re

with open('src/app/(app)/chat/[orderId]/page.tsx', 'r') as f:
    content = f.read()

bad = """        onSave={async (url: string) => {
        const blob = await (await fetch(url)).blob();
          const formData = new FormData();
          formData.append('file', blob, 'collage.jpg');
          formData.append('key_name', 'chat_attachments');
          try {
            const uploadRes = await api.post(URL_UPLOAD, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = uploadRes.data?.url || uploadRes.data?.data?.url || uploadRes.data?.fileUrl || uploadRes.data?.data?.full_url || '';
            if (url) {
              await api.post(`/customer-portal/orders/${orderId}/outfits/${collageMakerOutfitId}/requests`, {
                message: 'Uploaded Photos',
                attachment_url: url
              });
              window.location.reload();
            }
          } catch (e) {
            console.error('Failed to upload collage', e);
          }
        }}"""

good = """        onSave={async (url: string) => {
          const blob = await (await fetch(url)).blob();
          const token = localStorage.getItem('sewvee_customer_token') ?? '';
          const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          const formData = new FormData();
          formData.append('file', new File([blob], `collage_${Date.now()}.jpg`, { type: 'image/jpeg' }));
          formData.append('key_name', 'chat_attachments');
          try {
            const uploadRes = await fetch(URL_UPLOAD, {
              method: 'POST',
              headers: { Authorization: formattedToken },
              body: formData,
            });
            const uploadJson = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(`Upload failed`);
            
            const fileUrl = uploadJson.file_url ?? uploadJson.data?.file_url ?? uploadJson.data?.full_url ?? uploadJson.data?.url ?? uploadJson.full_url ?? uploadJson.url ?? '';
            
            if (fileUrl) {
              await api.post(`/customer-portal/orders/${orderId}/outfits/${collageMakerOutfitId}/requests`, {
                message: 'Uploaded Photos',
                attachment_url: fileUrl
              });
              setCollageMakerOutfitId(null);
              window.location.reload();
            } else {
              throw new Error('No URL returned');
            }
          } catch (e) {
            console.error('Failed to upload collage', e);
            alert("Failed to upload photos. Please try again.");
          }
        }}"""

content = content.replace(bad, good)

with open('src/app/(app)/chat/[orderId]/page.tsx', 'w') as f:
    f.write(content)
