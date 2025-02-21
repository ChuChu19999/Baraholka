import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Fade,
} from '@mui/material';
import { Send as SendIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  fetchChatMessages,
  sendMessage,
  markMessagesAsRead,
  fetchChats,
  setCurrentChat,
} from '../../store/slices/chatSlice';
import { formatDateTime } from '../../utils/dateUtils';

const MotionContainer = motion(Container);
const MotionBox = motion(Box);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -10 },
};

function ChatPage() {
  const { chatId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const intervalRef = useRef(null);

  const { currentChat, messages, loading, error } = useSelector(state => state.chat);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [messagesMarkedAsRead, setMessagesMarkedAsRead] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('ChatPage: Начало загрузки данных чата');

        if (!isAuthenticated || !user) {
          console.log('ChatPage: Пользователь не аутентифицирован');
          navigate('/login');
          return;
        }

        console.log('ChatPage: Загрузка списка чатов');
        const chatsResult = await dispatch(fetchChats()).unwrap();
        const chats = chatsResult?.results || chatsResult || [];
        const currentChat = chats.find(chat => chat.id === parseInt(chatId));

        if (currentChat) {
          console.log('ChatPage: Устанавливаем текущий чат');
          dispatch(setCurrentChat(currentChat));
          await dispatch(fetchChatMessages(chatId)).unwrap();
          setMessagesMarkedAsRead(false);
        } else {
          console.log('ChatPage: Чат не найден');
          navigate('/chats');
        }
      } catch (error) {
        console.error('ChatPage: Ошибка при загрузке данных чата:', error);
        if (error?.response?.status === 401) {
          navigate('/login');
        } else {
          navigate('/chats');
        }
      }
    };

    loadInitialData();

    let intervalId = null;
    if (isAuthenticated && user && chatId) {
      console.log('ChatPage: Установка интервала обновления сообщений');
      intervalId = setInterval(() => {
        console.log('ChatPage: Периодическое обновление сообщений');
        dispatch(fetchChatMessages(chatId));
      }, 5000);
    }

    return () => {
      if (intervalId) {
        console.log('ChatPage: Очистка интервала обновления сообщений');
        clearInterval(intervalId);
      }
      dispatch(setCurrentChat(null));
      setMessagesMarkedAsRead(false);
    };
  }, [dispatch, chatId, navigate, isAuthenticated, user]);

  useEffect(() => {
    if (Array.isArray(messages) && messages.length > 0 && !messagesMarkedAsRead) {
      console.log('ChatPage: Отмечаем сообщения как прочитанные');
      dispatch(markMessagesAsRead(chatId));
      setMessagesMarkedAsRead(true);
    }

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dispatch, chatId, messages, messagesMarkedAsRead]);

  useEffect(() => {
    setMessagesMarkedAsRead(false);
  }, [chatId]);

  const handleSendMessage = async e => {
    e.preventDefault();
    if (newMessage.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await dispatch(sendMessage({ chatId, text: newMessage.trim() })).unwrap();
        setNewMessage('');
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        console.error('Ошибка при отправке сообщения:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    navigate('/chats');
  };

  if (loading && !currentChat) {
    return (
      <Container
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => {
                dispatch(fetchChats());
                dispatch(fetchChatMessages(chatId));
              }}
            >
              Повторить
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!currentChat) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          }
        >
          Чат не найден
        </Alert>
      </Container>
    );
  }

  const otherParticipant = currentChat.participants?.find(p => p.id !== user?.id) || {};

  return (
    <MotionContainer
      maxWidth="md"
      sx={{
        height: 'calc(100vh - 120px)',
        p: '0 !important',
        px: '0 !important',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f8f9fa',
        my: 2,
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AppBar
        position="static"
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid',
          borderColor: 'divider',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
        elevation={0}
      >
        <Toolbar sx={{ minHeight: '70px' }}>
          <IconButton
            edge="start"
            onClick={handleBack}
            sx={{
              mr: 2,
              color: 'text.primary',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Avatar
            sx={{
              mr: 2,
              bgcolor: 'primary.main',
              width: 45,
              height: 45,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {otherParticipant?.username?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: '1.1rem',
              }}
            >
              {otherParticipant?.username || 'Пользователь'}
            </Typography>
            {currentChat?.product && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  fontSize: '0.85rem',
                }}
              >
                {currentChat.product.title}
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          bgcolor: '#f8f9fa',
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
        }}
      >
        {loading && !messages.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={30} sx={{ color: 'primary.main' }} />
          </Box>
        )}

        <AnimatePresence mode="popLayout">
          {Array.isArray(messages) &&
            messages.map(message => {
              if (!message || typeof message !== 'object') return null;
              const messageData = message.message || message;
              if (!messageData.id || !messageData.text || !messageData.sender) return null;

              const isCurrentUser =
                messageData.sender === user?.id || messageData.sender.id === user?.id;

              return (
                <MotionBox
                  key={messageData.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  sx={{
                    display: 'flex',
                    justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                    px: 2,
                  }}
                >
                  {!isCurrentUser && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 1,
                        mt: 1,
                        bgcolor: 'primary.light',
                        fontSize: '0.875rem',
                      }}
                    >
                      {messageData.sender_username?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: isCurrentUser ? 'primary.main' : 'white',
                      color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                      borderRadius: isCurrentUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                      position: 'relative',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        mb: 0.5,
                        display: 'block',
                        color: isCurrentUser ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                        fontWeight: 500,
                      }}
                    >
                      {messageData.sender_username || (isCurrentUser ? 'Вы' : 'Пользователь')}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}
                    >
                      {messageData.text}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        textAlign: 'right',
                        mt: 0.5,
                        opacity: 0.8,
                        fontSize: '0.75rem',
                        color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                      }}
                    >
                      {messageData.created_at ? formatDateTime(messageData.created_at) : ''}
                    </Typography>
                  </Paper>
                  {isCurrentUser && (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        ml: 1,
                        mt: 1,
                        bgcolor: 'primary.dark',
                        fontSize: '0.875rem',
                      }}
                    >
                      {user?.username?.[0]?.toUpperCase() || 'В'}
                    </Avatar>
                  )}
                </MotionBox>
              );
            })}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </Box>

      <Fade in={true}>
        <Paper
          component="form"
          onSubmit={handleSendMessage}
          sx={{
            p: 1.5,
            bgcolor: 'white',
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            position: 'relative',
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: 0,
              right: 0,
              height: '2px',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 100%)',
            },
          }}
          elevation={0}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Введите сообщение..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            size="small"
            disabled={isSubmitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f8f9fa',
                '&:hover': {
                  '& > fieldset': {
                    borderColor: 'primary.main',
                  },
                },
                '& fieldset': {
                  borderColor: 'divider',
                },
              },
              '& .MuiOutlinedInput-input': {
                padding: '10px 14px',
              },
            }}
          />
          <IconButton
            color="primary"
            type="submit"
            disabled={!newMessage.trim() || isSubmitting}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isSubmitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <SendIcon />}
          </IconButton>
        </Paper>
      </Fade>
    </MotionContainer>
  );
}

export default ChatPage;
