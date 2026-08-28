export function error(code:string,message:string,status=400){return Response.json({error:{code,message}},{status})}
