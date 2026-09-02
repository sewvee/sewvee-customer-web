with open('src/components/CollageMaker.tsx', 'r') as f:
    code = f.read()

old_loadImg = """    const loadImg = (src:string): Promise<HTMLImageElement> => new Promise((res,rej)=>{
      const img=new Image(); img.crossOrigin='anonymous';
      img.onload=()=>res(img);
      img.onerror=()=>{const i2=new Image();i2.onload=()=>res(i2);i2.onerror=rej;i2.src=src;};
      img.src=src;
    });"""

new_loadImg = """    const loadImg = (src:string): Promise<HTMLImageElement> => new Promise((res,rej)=>{
      const img=new Image();
      img.onload=()=>res(img);
      img.onerror=(e)=>rej(e);
      img.src=src;
    });"""

code = code.replace(old_loadImg, new_loadImg)

with open('src/components/CollageMaker.tsx', 'w') as f:
    f.write(code)
print("Done")
