import crypto from 'crypto';

export function getBucket(userId:string,flagKey:string):number {
    
    const input = `${userId}-${flagKey}`;

    const hash = crypto.createHash('md5').update(input).digest('hex');

    const num = parseInt(hash.substring(0,8),16);

    return num % 100
}