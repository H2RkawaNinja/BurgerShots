const jwt = require('jsonwebtoken');
const { Mitarbeiter, Rolle, Recht } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Nicht autorisiert. Token fehlt.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const mitarbeiter = await Mitarbeiter.findByPk(decoded.id, {
      include: [{ model: Rolle, as: 'rolle', include: [{ model: Recht, as: 'rechte' }] }]
    });

    if (!mitarbeiter || !mitarbeiter.aktiv) {
      return res.status(401).json({ error: 'Mitarbeiter nicht gefunden oder inaktiv.' });
    }

    req.mitarbeiter = mitarbeiter;
    req.rechte = mitarbeiter.rolle?.rechte?.map(r => r.schluessel) || [];
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Ungültiger Token.' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token abgelaufen.' });
    console.error('Auth Fehler:', error);
    return res.status(500).json({ error: 'Authentifizierungsfehler.' });
  }
};

const requirePermission = (...rechte) => (req, res, next) => {
  if (!req.rechte) return res.status(403).json({ error: 'Keine Berechtigungen gefunden.' });
  if (!rechte.some(r => req.rechte.includes(r))) {
    return res.status(403).json({ error: 'Keine Berechtigung für diese Aktion.', required: rechte });
  }
  next();
};

module.exports = { authenticate, requirePermission };
