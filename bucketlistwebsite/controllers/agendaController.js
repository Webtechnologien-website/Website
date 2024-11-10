exports.agenda_get = (req, res) => {
    res.render('agenda', { 
      title: 'Agenda', 
      user: req.user  // Assuming `req.user` holds the authenticated user's data
    });
  };
  