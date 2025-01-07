// https://blog.logrocket.com/implementing-copy-clipboard-react-clipboard-api/

export default async function copyToClipboard(text:string) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } 

    throw new Error('Cannot find "clipboard" in "navigator": please make sure you are accessing this site with "localhost" or "https"')
  }