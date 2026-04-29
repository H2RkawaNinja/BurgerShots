const { AktivitaetsLog } = require('../models');

const logAktion = async (aktion, kategorie, mitarbeiter = null, details = {}) => {
  try {
    await AktivitaetsLog.create({
      aktion,
      kategorie,
      mitarbeiter_id: mitarbeiter?.id || null,
      mitarbeiter_name: mitarbeiter ? `${mitarbeiter.vorname} ${mitarbeiter.nachname}` : null,
      details
    });
  } catch (err) {
    console.error('[Logger] Fehler beim Schreiben des Aktivitätslogs:', err.message);
  }
};

module.exports = { logAktion };
