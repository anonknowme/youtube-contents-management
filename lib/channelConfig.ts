/**
 * 허용된 채널 목록 설정
 * 
 * 개발 환경: 모든 채널 허용
 * 프로덕션: 화이트리스트만 허용
 */

export interface AllowedChannel {
    id: string;
    name: string;
    description?: string;
}

// 채널 목록
export const ALLOWED_CHANNELS: AllowedChannel[] = [
    {
        id: 'UCKajCwiIKhRieKpvKZmFtHA',
        name: '지분전쟁⚡️상원수',
        description: '어둠의 네딸바'
    },
    {
        id: 'UC9DUWk8qTAgxeYX0kH0muNw',
        name: '오렌지캬라멜비트코인',
        description: '미존개오'
    },
    {
        id: 'UC1f_j9wOASvYAvADpwTXT0Q',
        name: '리스펙',
        description: '말해뭐해'
    },
    {
        id: 'UCYbuSoIMrSja-UsbdSLa_gw',
        name: '하워드',
        description: '조곤조곤, 차분'
    },
    {
        id: 'UCvtSl9-RaZgcd3oE8e88-lw',
        name: '데드섹',
        description: '비트코인 지식저장소'
    },
    {
        id: 'UCT_RhM-i6or1qS1JRm4Bqrw',
        name: '네딸바',
        description: '빛의 상원수'
    },
    {
        id: 'UCT745jE-45-ZBvB6zT_7EnA',
        name: '리버스온',
        description: '리버스온'
    },
    {
        id: 'UC1OxcwoU_Pu5CPoVhrUyDgg',
        name: 'Buck차는 비트코인',
        description: ''
    },
    {
        id: 'UCVLrq7pwVPTPHszFNbr8mSA',
        name: '1분 비트코인',
        description: ''
    },
];

/**
 * 채널 ID가 허용되는지 확인
 * 
 * @param channelId - 확인할 채널 ID
 * @returns 개발 환경이면 true, 프로덕션이면 화이트리스트 체크
 */
export function isChannelAllowed(channelId: string): boolean {
    // 개발 환경에서는 모든 채널 허용
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // 프로덕션에서는 화이트리스트만 허용
    return ALLOWED_CHANNELS.some(channel => channel.id === channelId);
}

/**
 * 허용된 채널 목록 가져오기
 */
export function getAllowedChannels(): AllowedChannel[] {
    return ALLOWED_CHANNELS;
}
