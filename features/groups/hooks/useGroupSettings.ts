
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../../../services/groupService';
import { authService } from '../../../services/authService';
import { db } from '../../../database';
import { Group, User, GroupLink, VipMediaItem } from '../../../types';
import { useModal } from '../../../components/ModalSystem';

export const useGroupSettings = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { showConfirm, showAlert } = useModal();
    
    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
    const [isOwner, setIsOwner] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    // Form States
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
    const [approveMembers, setApproveMembers] = useState(false);
    const [pendingRequests, setPendingRequests] = useState<User[]>([]);
    const [links, setLinks] = useState<GroupLink[]>([]);
    const [onlyAdminsPost, setOnlyAdminsPost] = useState(false);
    const [msgSlowMode, setMsgSlowMode] = useState(false);
    const [msgSlowModeInterval, setMsgSlowModeInterval] = useState('30');
    const [joinSlowMode, setJoinSlowMode] = useState(false);
    const [joinSlowModeInterval, setJoinSlowModeInterval] = useState('60');
    const [memberLimit, setMemberLimit] = useState<number | ''>('');
    const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
    const [members, setMembers] = useState<{ id: string, name: string, role: string, isMe: boolean, avatar?: string }[]>([]);
    const [vipPrice, setVipPrice] = useState('');
    const [vipCurrency, setVipCurrency] = useState<'BRL' | 'USD'>('BRL');
    const [vipDoorText, setVipDoorText] = useState('');
    const [vipButtonText, setVipButtonText] = useState('');
    const [vipMediaItems, setVipMediaItems] = useState<VipMediaItem[]>([]);
    const [pixelId, setPixelId] = useState('');
    const [pixelToken, setPixelToken] = useState('');

    useEffect(() => {
        const email = authService.getCurrentUserEmail();
        setCurrentUserEmail(email);

        if (id) {
            const foundGroup = groupService.getGroupById(id);
            if (foundGroup) {
                setGroup(foundGroup);
                const currentUserId = authService.getCurrentUserId();
                const owner = foundGroup.creatorId === currentUserId;
                const admin = owner || (currentUserId && foundGroup.adminIds?.includes(currentUserId)) || false;
                setIsOwner(owner);
                setIsAdmin(admin);

                setGroupName(foundGroup.name);
                setDescription(foundGroup.description);
                setCoverImage(foundGroup.coverImage);

                if (foundGroup.settings) {
                    setApproveMembers(foundGroup.settings.approveMembers || false);
                    setOnlyAdminsPost(foundGroup.settings.onlyAdminsPost || false);
                    setMsgSlowMode(foundGroup.settings.msgSlowMode || false);
                    setMsgSlowModeInterval(foundGroup.settings.msgSlowModeInterval?.toString() || '30');
                    setJoinSlowMode(foundGroup.settings.joinSlowMode || false);
                    setJoinSlowModeInterval(foundGroup.settings.joinSlowModeInterval?.toString() || '60');
                    setMemberLimit(foundGroup.settings.memberLimit || '');
                    setForbiddenWords(foundGroup.settings.forbiddenWords || []);
                }

                setLinks(foundGroup.links || []);
                setPendingRequests(groupService.getPendingMembers(id));
                const rawMembers = groupService.getGroupMembers(id);
                setMembers(rawMembers.map(u => ({
                    id: u.id,
                    name: u.profile?.nickname || u.profile?.name || 'Usuário',
                    role: u.id === foundGroup.creatorId ? 'Dono' : (foundGroup.adminIds?.includes(u.id) ? 'Admin' : 'Membro'),
                    isMe: u.id === currentUserId,
                    avatar: u.profile?.photoUrl
                })));

                if (foundGroup.isVip) {
                    setVipPrice(foundGroup.price ? parseFloat(foundGroup.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '');
                    setVipCurrency((foundGroup.currency as 'BRL' | 'USD') || 'BRL');
                    setVipDoorText(foundGroup.vipDoor?.text || '');
                    setVipButtonText(foundGroup.vipDoor?.buttonText || '');
                    setVipMediaItems(foundGroup.vipDoor?.mediaItems || (foundGroup.vipDoor?.media ? [{url: foundGroup.vipDoor.media, type: 'image'}] : []));
                    setPixelId(foundGroup.pixelId || '');
                    setPixelToken(foundGroup.pixelToken || '');
                }
            }
            setLoading(false);
        }
    }, [id]);

    const handleSave = async () => {
        if (!group) return;
        const rawPrice = vipPrice.replace(/\./g, '').replace(',', '.');
        const updatedGroup: Group = {
            ...group,
            name: groupName,
            description,
            coverImage,
            price: rawPrice,
            currency: vipCurrency,
            pixelId,
            pixelToken,
            vipDoor: group.isVip ? { ...group.vipDoor, text: vipDoorText, buttonText: vipButtonText, mediaItems: vipMediaItems } : group.vipDoor,
            settings: {
                approveMembers,
                onlyAdminsPost,
                msgSlowMode,
                msgSlowModeInterval: parseInt(msgSlowModeInterval),
                joinSlowMode,
                joinSlowModeInterval: parseInt(joinSlowModeInterval),
                memberLimit: memberLimit === '' ? undefined : Number(memberLimit),
                forbiddenWords
            }
        };
        await groupService.updateGroup(updatedGroup);
        await showAlert('Sucesso', 'Configurações salvas com sucesso!');
    };

    const handlePendingAction = (userId: string, action: 'accept' | 'deny') => {
        if (!id) return;
        if (action === 'accept') groupService.approveMember(id, userId);
        else groupService.rejectMember(id, userId);
        setPendingRequests(prev => prev.filter(u => u.id !== userId));
    };

    const handleMemberAction = async (memberId: string, action: 'kick' | 'ban' | 'promote' | 'demote') => {
        if (!id) return;
        let confirmMsg = '';
        if (action === 'kick') confirmMsg = 'Remover membro?';
        if (action === 'ban') confirmMsg = 'Banir membro permanentemente?';
        if (action === 'promote') confirmMsg = 'Promover a Administrador?';
        if (action === 'demote') confirmMsg = 'Rebaixar para Membro?';

        if (await showConfirm('Ação de Membro', confirmMsg)) {
            if (action === 'kick') groupService.removeMember(id, memberId);
            if (action === 'ban') groupService.banMember(id, memberId);
            if (action === 'promote') groupService.promoteMember(id, memberId);
            if (action === 'demote') groupService.demoteMember(id, memberId);
            
            if (action === 'kick' || action === 'ban') {
                setMembers(prev => prev.filter(m => m.id !== memberId));
            } else {
                setMembers(prev => prev.map(m => m.id === memberId ? {...m, role: action === 'promote' ? 'Admin' : 'Membro'} : m));
            }
        }
    };

    const handleManualRelease = async (manualUsername: string) => {
        if (!manualUsername.trim() || !group) return;
        const cleanHandle = manualUsername.replace('@', '').toLowerCase();
        const user = await authService.fetchUserByHandle(cleanHandle);
        if (user) {
            db.vipAccess.grant({
                userId: user.id,
                groupId: group.id,
                status: 'active',
                purchaseDate: Date.now(),
                transactionId: `manual_${Date.now()}`
            });
            groupService.approveMember(group.id, user.id);
            await showAlert('Acesso Liberado', `Acesso liberado para @${cleanHandle}`);
            return true;
        } else {
            await showAlert('Erro', 'Usuário não encontrado.');
            return false;
        }
    };

    const handleLeaveDelete = async (type: 'leave' | 'delete') => {
        if (!group) return;
        const msg = type === 'leave' ? 'Sair do grupo?' : 'EXCLUIR GRUPO PERMANENTEMENTE?';
        if (await showConfirm(type === 'leave' ? 'Sair' : 'Excluir', msg)) {
            if (type === 'leave') await groupService.leaveGroup(group.id);
            else await groupService.deleteGroup(group.id);
            navigate('/groups');
        }
    };

    return {
        id, group, loading, isOwner, isAdmin, handleSave, handleLeaveDelete,
        handlePendingAction, handleMemberAction, handleManualRelease,
        form: {
            groupName, setGroupName, description, setDescription, coverImage, setCoverImage,
            approveMembers, setApproveMembers, pendingRequests, setPendingRequests,
            links, setLinks, onlyAdminsPost, setOnlyAdminsPost,
            msgSlowMode, setMsgSlowMode, msgSlowModeInterval, setMsgSlowModeInterval,
            joinSlowMode, setJoinSlowMode, joinSlowModeInterval, setJoinSlowModeInterval,
            memberLimit, setMemberLimit, forbiddenWords, setForbiddenWords,
            members, setMembers, vipPrice, setVipPrice, vipCurrency, setVipCurrency,
            vipDoorText, setVipDoorText, vipButtonText, setVipButtonText,
            vipMediaItems, setVipMediaItems, pixelId, setPixelId, pixelToken, setPixelToken
        }
    };
};
