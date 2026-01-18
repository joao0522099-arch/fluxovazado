
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { groupService } from '../services/groupService';
import { authService } from '../services/authService';
import { db } from '@/database';
import { Group, User, GroupLink, VipMediaItem } from '../types';
import { useModal } from '../components/ModalSystem';

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
        const currentUserId = authService.getCurrentUserId();
        const email = authService.getCurrentUserEmail();
        setCurrentUserEmail(email);

        if (id) {
            const foundGroup = groupService.getGroupById(id);
            if (foundGroup) {
                setGroup(foundGroup);
                // Fix: Changed 'creatorEmail' check to 'creatorId' and used 'adminIds' for role checking
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
                // Fix: Changed mapping to use UUIDs and renamed 'admins' to 'adminIds'
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
