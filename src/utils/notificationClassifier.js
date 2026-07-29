/**
 * Construit une entrée de notification interne à partir d'un événement
 * WebSocket (model.updated) déjà diffusé par le backend. Retourne null si
 * (model, action) n'est pas un événement géré par le centre de notifications.
 */
export function classifyNotification(model, action, data, ctx = {}) {
  const items = Array.isArray(data) ? data : [data].filter(Boolean);
  const first = items[0] || {};
  const count = items.length;

  const base = {
    id: `${model}-${action}-${first.id ?? first.code_colis ?? Date.now()}`,
    model,
    action,
    read: false,
    createdAt: new Date().toISOString(),
  };

  if (model === 'Colis' && (action === 'assigned' || action === 'received_by_backoffice')) {
    return {
      ...base,
      title: 'Colis à réceptionner',
      message: count > 1
        ? `${count} colis vous ont été assignés pour réception.`
        : `Le colis ${first.code_colis || ''} vous a été assigné pour réception.`,
      link: '/colis-a-receptionner',
    };
  }

  if (model === 'Colis' && action === 'blocked') {
    return {
      ...base,
      title: 'Colis bloqué',
      message: count > 1
        ? `${count} colis expédiés par votre agence ont été bloqués.${first.motif_blocage ? ` Motif : ${first.motif_blocage}` : ''}`
        : `Le colis ${first.code_colis || ''} a été bloqué.${first.motif_blocage ? ` Motif : ${first.motif_blocage}` : ''}`,
      link: '/colis',
    };
  }

  if (model === 'Colis' && action === 'unblocked') {
    return {
      ...base,
      title: 'Colis débloqué',
      message: count > 1
        ? `${count} colis expédiés par votre agence ont été débloqués.`
        : `Le colis ${first.code_colis || ''} a été débloqué.`,
      link: '/colis',
    };
  }

  return null;
}
