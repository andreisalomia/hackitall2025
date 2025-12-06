import { Howl } from 'howler';

// Configurare sunete pentru diferite priorități
const sounds = {
  ridicata: new Howl({
    src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzSEy/DZiToIE2i56+mdTgwOU6rh87BhHQc3ktjyyHgtBSd+zO7aj0AJFGGy6+mmVRIJR6Hf9b1rIQg2gsr05Ik8ByRwv+vrnkwLD1Wn4POxYx4IOpPY8sd5KwUme8vt4I4/CRVjte3ppVUSCUii4Pa9aiEJOIPK9OSJPAclcb/r6p5MCw9WqODzsmMeCTqU2PLHeSwGJ3zL7eCOQAkVY7Xt6aVVEgpJouD2vWohCTiEyvTkiTwHJXG/6+ueTQwPVqjg9LJkHgk6ldjyx3ktBid8y+3gjj8JFmO17emlVRIKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04MD1ao4PSyZB4KOpXY8sd5LQcnfMvt4I4/CRZjtOzppVUSCkmi4Pa9aiEKOITK9OSJPAclcb/r6p5NDA9WqOD0smQeCjqV2PLHeS0HJ3zL7eCOPwkWY7Xs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTQwPVqjg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAo='],
    volume: 0.1,
    rate: 1.5
  }),
  medie: new Howl({
    src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzSEy/DZiToIE2i56+mdTgwOU6rh87BhHQc3ktjyyHgtBSd+zO7aj0AJFGGy6+mmVRIJR6Hf9b1rIQg2gsr05Ik8ByRwv+vrnkwLD1Wn4POxYx4IOpPY8sd5KwUme8vt4I4/CRVjte3ppVUSCUii4Pa9aiEJOIPK9OSJPAclcb/r6p5MCw9WqODzsmMeCTqU2PLHeSwGJ3zL7eCOQAkVY7Xt6aVVEgpJouD2vWohCTiEyvTkiTwHJXG/6+ueTQwPVqjg9LJkHgk6ldjyx3ktBid8y+3gjj8JFmO17emlVRIKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04MD1ao4PSyZB4KOpXY8sd5LQcnfMvt4I4/CRZjtOzppVUSCkmi4Pa9aiEKOITK9OSJPAclcb/r6p5NDA9WqOD0smQeCjqV2PLHeS0HJ3zL7eCOPwkWY7Xs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTQwPVqjg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAo='],
    volume: 0.1,
    rate: 1.0
  }),
  scazuta: new Howl({
    src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzSEy/DZiToIE2i56+mdTgwOU6rh87BhHQc3ktjyyHgtBSd+zO7aj0AJFGGy6+mmVRIJR6Hf9b1rIQg2gsr05Ik8ByRwv+vrnkwLD1Wn4POxYx4IOpPY8sd5KwUme8vt4I4/CRVjte3ppVUSCUii4Pa9aiEJOIPK9OSJPAclcb/r6p5MCw9WqODzsmMeCTqU2PLHeSwGJ3zL7eCOQAkVY7Xt6aVVEgpJouD2vWohCTiEyvTkiTwHJXG/6+ueTQwPVqjg9LJkHgk6ldjyx3ktBid8y+3gjj8JFmO17emlVRIKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04MD1ao4PSyZB4KOpXY8sd5LQcnfMvt4I4/CRZjtOzppVUSCkmi4Pa9aiEKOITK9OSJPAclcb/r6p5NDA9WqOD0smQeCjqV2PLHeS0HJ3zL7eCOPwkWY7Xs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTQwPVqjg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAoWYrXs6aVVEwpJouD2vWohCjiEyvTkiTwHJXG/6+ueTg0PVqfg9LJkHgo6ldjyx3ktByh9y+3fjkAKFmK17OmlVRMKSaLg9r1qIQo4hMr05Ik8ByVxv+vrn04ND1an4PSyZB4KOpXY8sd5LQcofcvt345AChZite3ppVUTCkmi4Pa9aiEKOITK9OSJPAclcb/r659ODQ9Wp+D0smQeCjqV2PLHeS0HKH3L7d+OQAo='],
    volume: 0.1,
    rate: 0.8
  })
};

class NotificationService {
  constructor() {
    this.notifications = [];
    this.checkInterval = null;
    this.listeners = [];
    this.isChecking = false;
    this.soundIntervals = {}; // Pentru repeat sounds
  }

  // Începe verificarea automată a taskurilor
  startChecking(intervalMinutes = 1) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Prima verificare imediat
    this.checkUpcomingTasks();

    // Apoi verifică periodic
    this.checkInterval = setInterval(() => {
      this.checkUpcomingTasks();
    }, intervalMinutes * 60 * 1000);

    console.log(`[NotificationService] Verificare automată pornită (interval: ${intervalMinutes} min)`);
  }

  // Oprește verificarea automată
  stopChecking() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('[NotificationService] Verificare automată oprită');
    }
  }

  // Verifică taskurile care trebuie notificate
  async checkUpcomingTasks() {
    if (this.isChecking) return; // Previne multiple verificări simultane
    
    this.isChecking = true;
    
    try {
      const response = await fetch('http://localhost:5000/todos/active');
      const data = await response.json();

      if (!data.success || !data.todos) {
        console.error('[NotificationService] Eroare la încărcarea taskurilor');
        return;
      }

      const now = new Date();
      const tasksToNotify = data.todos.filter(task => {
        if (!task.due_datetime) return false;

        const dueDate = new Date(task.due_datetime);
        const minutesUntilDue = (dueDate - now) / (1000 * 60);

        // Verifică dacă taskul trebuie notificat
        const reminderMinutes = task.reminder_minutes_before || 15;
        
        // Notifică dacă suntem în fereastra de reminder
        // și nu am notificat deja (verificăm dacă e în lista de notificări active)
        const shouldNotify = minutesUntilDue <= reminderMinutes && 
                           minutesUntilDue >= 0 &&
                           !this.isTaskAlreadyNotified(task._id);

        return shouldNotify;
      });

      // Afișează notificări pentru taskurile găsite
      tasksToNotify.forEach(task => {
        this.showNotification(task);
      });

    } catch (error) {
      console.error('[NotificationService] Eroare la verificarea taskurilor:', error);
    } finally {
      this.isChecking = false;
    }
  }

  // Verifică dacă un task este deja notificat
  isTaskAlreadyNotified(taskId) {
    return this.notifications.some(n => n.id === taskId);
  }

  // Afișează o notificare
  showNotification(task) {
    // Previne duplicate
    if (this.isTaskAlreadyNotified(task._id)) {
      return;
    }

    // Adaugă în lista de notificări active
    this.notifications.push({
      id: task._id,
      task: task,
      timestamp: new Date()
    });

    // Redă sunetul corespunzător IMEDIAT
    this.playSound(task.priority);

    // Începe repeat sound pentru această notificare
    this.startRepeatSound(task._id, task.priority);

    // Notifică listenerii (componenta React)
    this.notifyListeners({
      type: 'show',
      task: task
    });

    console.log(`[NotificationService] Notificare afișată pentru: ${task.task}`);
  }

  // Pornește repeat sound pentru o notificare
  startRepeatSound(taskId, priority) {
    // Interval bazat pe prioritate
    const intervals = {
      'ridicata': 500,   // La fiecare 2 secunde
      'medie': 1000,      // La fiecare 3 secunde
      'scazuta': 1500    // La fiecare 15 secunde
    };

    const interval = intervals[priority] || 8000;

    // Creează interval pentru repeat
    const soundInterval = setInterval(() => {
      // Verifică dacă notificarea mai există
      if (this.isTaskAlreadyNotified(taskId)) {
        this.playSound(priority);
      } else {
        // Dacă notificarea a fost închisă, oprește repeat-ul
        this.stopRepeatSound(taskId);
      }
    }, interval);

    // Salvează intervalul pentru a-l putea opri mai târziu
    this.soundIntervals[taskId] = soundInterval;

    console.log(`[NotificationService] Repeat sound pornit pentru ${taskId} (interval: ${interval}ms)`);
  }

  // Oprește repeat sound pentru o notificare
  stopRepeatSound(taskId) {
    if (this.soundIntervals[taskId]) {
      clearInterval(this.soundIntervals[taskId]);
      delete this.soundIntervals[taskId];
      console.log(`[NotificationService] Repeat sound oprit pentru ${taskId}`);
    }
  }

  // Elimină o notificare (când utilizatorul o închide)
  dismissNotification(taskId) {
    this.notifications = this.notifications.filter(n => n.id !== taskId);
    
    // Oprește repeat sound-ul pentru această notificare
    this.stopRepeatSound(taskId);
    
    this.notifyListeners({
      type: 'dismiss',
      taskId: taskId
    });

    console.log(`[NotificationService] Notificare închisă: ${taskId}`);
  }

  // Redă sunetul pentru notificare
  playSound(priority = 'medie') {
    const sound = sounds[priority] || sounds.medie;
    sound.play();
  }

  // Test manual pentru o notificare
  testNotification(task) {
    console.log('[NotificationService] Test notificare manuală');
    this.showNotification(task);
  }

  // Adaugă listener pentru schimbări
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // Notifică toți listenerii
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('[NotificationService] Eroare la notificarea listener-ului:', error);
      }
    });
  }

  // Curăță notificările vechi (opțional, pentru a elibera memorie)
  cleanup(maxAge = 60) {
    const now = new Date();
    const oldNotifications = this.notifications.filter(n => {
      const age = (now - n.timestamp) / (1000 * 60); // în minute
      return age >= maxAge;
    });

    // Oprește repeat sounds pentru notificările vechi
    oldNotifications.forEach(n => {
      this.stopRepeatSound(n.id);
    });

    // Elimină notificările vechi
    this.notifications = this.notifications.filter(n => {
      const age = (now - n.timestamp) / (1000 * 60);
      return age < maxAge;
    });
  }

  // Cleanup complet - oprește toate interval-urile
  destroy() {
    // Oprește verificarea automată
    this.stopChecking();

    // Oprește toate repeat sounds
    Object.keys(this.soundIntervals).forEach(taskId => {
      this.stopRepeatSound(taskId);
    });

    // Curăță listeners
    this.listeners = [];
    this.notifications = [];

    console.log('[NotificationService] Service distrus complet');
  }
}

// Instanță singleton
const notificationService = new NotificationService();

export default notificationService;