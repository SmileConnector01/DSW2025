    fetch('http://localhost:80/SmileConnector/backend/recent_activities.php')
    .then(res => {
      if (!res.ok) throw new Error('Network error');
      return res.json();
    })
    .then(activities => {
      activities.forEach(action => { 
        const now = new Date();
        const activityTime = new Date(action.time);

        // Get difference in milliseconds
        const diffMs = now - activityTime;

        // Convert to minutes and hours
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        let recent_activities = document.getElementById('recent-activities');
        if(dashboard) {
            recent_activities.innerHTML += `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas fa-tooth"></i>
                    </div>
                    <div class="activity-details">
                    <p>${action.description}</p>
                    <span class="activity-time">${diffHours}:${diffMinutes} ago</span>
                  </div>
                </div>
            `;
        }
      });
    })
    .catch(err => {
      console.error('Failed loading activities:', err);
      // you could show a message to the user here
    });