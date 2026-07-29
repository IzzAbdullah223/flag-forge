import { getBucket } from "./hashing";
import { evaluateGroup,RuleGroup,UserContext } from "./rules";

export interface FlagStateInput {
    enabled:boolean;
    rolloutPercent:number
    rules: RuleGroup | null
}

export interface EvaluationResult{
    flagKey: string
    enabled: boolean;
    reason: 'FLAG_DISABLED' | 'RULE_MATCH' | 'ROLLOUT' | 'DEFAULT';
}

export function evaluateFlag(flagKey:string,flagState:FlagStateInput,user:UserContext): EvaluationResult{

    if(!flagState.enabled){
        return {flagKey,enabled:false,reason: 'FLAG_DISABLED'}
    }

    if(flagState.rules && evaluateGroup(flagState.rules, user)){
        return {flagKey, enabled:true, reason: 'RULE_MATCH'}
    }

    const bucket = getBucket(String(user.id),flagKey);

    if(bucket<flagState.rolloutPercent){
        return { flagKey, enabled:true, reason:'ROLLOUT'}
    }

    return {flagKey, enabled:false, reason: 'DEFAULT'}
}