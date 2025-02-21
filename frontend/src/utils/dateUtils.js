export const formatDate = dateString => {
  if (!dateString) return '';

  // Если дата уже в нужном формате (ДД.ММ.ГГГГ), возвращаем её как есть
  if (/^\d{2}\.\d{2}\.\d{4}/.test(dateString)) {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Дата не указана';
    }

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Ошибка при форматировании даты:', error);
    return 'Дата не указана';
  }
};

export const formatDateTime = dateString => {
  if (!dateString) return '';

  // Если дата уже в нужном формате (ДД.ММ.ГГГГ ЧЧ:ММ), возвращаем её как есть
  if (/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}/.test(dateString)) {
    return dateString;
  }

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Дата не указана';
    }

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
      .format(date)
      .replace(',', '');
  } catch (error) {
    console.error('Ошибка при форматировании даты и времени:', error);
    return 'Дата не указана';
  }
};
