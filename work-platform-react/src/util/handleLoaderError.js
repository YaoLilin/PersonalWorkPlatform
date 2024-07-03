function handleLoaderError(e) {
    throw new Response("接口错误，not found",{status:404})
}

export default handleLoaderError;