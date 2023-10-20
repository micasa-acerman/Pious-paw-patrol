const fs = require('fs');

function saveData(chatIds, filename) {
    const data = JSON.stringify(chatIds);
    fs.writeFileSync(filename, data);
}

function loadData(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}
function dayOfWeek(day) {
    const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    return daysOfWeek.indexOf(day);
}

function shuffleArray(array) {
    const result = [...array]
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return result
  }

module.exports = {saveData, loadData,dayOfWeek,shuffleArray}