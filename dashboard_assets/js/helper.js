 $(document).ready(function () {

   function account_age() {
    const accountAgeElement = $('#account-age');
    const createdDateStr = accountAgeElement.data('created'); // format: "2023-05-10T14:33:00Z" or similar
    const createdDate = new Date(createdDateStr);
    const now = new Date();
  
    const diffInMs = now - createdDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffInDays / 365);
    const months = Math.floor((diffInDays % 365) / 30);
    const days = diffInDays % 30;
  
    let ageText = '';
    if (years > 0) ageText += `${years} yr${years > 1 ? 's' : ''} `;
    if (months > 0) ageText += `${months} month${months > 1 ? 's' : ''} `;
    if (years === 0 && months === 0) ageText = `${days} day${days > 1 ? 's' : ''}`;
  
    accountAgeElement.text(`${ageText}`);
  
   }

   account_age();
  
        
    function updateDateTime() {

        const now = new Date();
  
        // Format time
        let hours = String(now.getHours()).padStart(2, '0');
        let minutes = String(now.getMinutes()).padStart(2, '0');
        let seconds = String(now.getSeconds()).padStart(2, '0');
        let time = `${hours}:${minutes}:${seconds}`;
  
        // Format date
        let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        let months = ["January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"];
        let date = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  
        // Update DOM
        $('#live_time').text(time);
        $('#section2_date').text(date);
        $('#header_date').text(date);
      }
  
      // Run immediately and update every second
      updateDateTime();
      setInterval(updateDateTime, 1000);
})