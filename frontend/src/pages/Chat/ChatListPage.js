import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import { fetchChats } from '../../store/slices/chatSlice';
import { formatDateTime } from '../../utils/dateUtils';
import { Link as RouterLink } from 'react-router-dom';

const MotionContainer = motion(Container);
const MotionListItem = motion(ListItem);

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

function ChatListPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { chats, loading, error } = useSelector(state => state.chat);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    const loadChats = async () => {
      try {
        console.log('ChatListPage: Загрузка списка чатов');
        await dispatch(fetchChats()).unwrap();
      } catch (error) {
        console.error('ChatListPage: Ошибка при загрузке чатов:', error);
      }
    };

    if (isAuthenticated) {
      loadChats();
    }
  }, [dispatch, isAuthenticated]);

  const handleChatClick = chatId => {
    console.log('Клик по чату:', chatId);
    console.log('Текущий путь:', window.location.pathname);
    navigate(`/chats/${chatId}`, { replace: true });
    console.log('Переход на /chats/' + chatId);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!Array.isArray(chats) || chats.length === 0) {
    return (
      <Container sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          У вас пока нет активных чатов
        </Typography>
        <Typography color="text.secondary">
          Начните общение с продавцом на странице товара
        </Typography>
      </Container>
    );
  }

  return (
    <MotionContainer
      maxWidth="md"
      sx={{ py: 4 }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Typography variant="h4" gutterBottom>
        Сообщения
      </Typography>

      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
        {chats.map((chat, index) => {
          if (!chat || !chat.participants || !Array.isArray(chat.participants)) {
            return null;
          }

          const otherParticipant = chat.participants.find(p => p?.id !== user?.id);
          const lastMessage = chat.last_message;
          const productTitle = chat.product?.title || 'Товар не найден';

          return (
            <React.Fragment key={chat.id}>
              <MotionListItem
                component={RouterLink}
                to={`/chats/${chat.id}`}
                variants={itemVariants}
                button
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={chat.unread_count || 0}
                    color="primary"
                    invisible={!chat.unread_count}
                  >
                    <Avatar>{otherParticipant?.username?.[0]?.toUpperCase() || '?'}</Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">
                        {otherParticipant?.username || 'Пользователь'}
                      </Typography>
                      {lastMessage?.created_at && (
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(lastMessage.created_at)}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {productTitle}
                      </Typography>
                      {lastMessage?.text && (
                        <Typography
                          variant="body2"
                          color={chat.unread_count ? 'primary' : 'text.secondary'}
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontWeight: chat.unread_count ? 500 : 400,
                          }}
                        >
                          {lastMessage.text}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </MotionListItem>
              {index < chats.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
      </List>
    </MotionContainer>
  );
}

export default ChatListPage;
