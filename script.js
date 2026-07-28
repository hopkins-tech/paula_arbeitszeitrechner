function timeStringToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTimeFormat(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} Min`;
  } else if (mins === 0) {
    return `${hours} Std`;
  } else {
    return `${hours}h ${mins}min`;
  }
}

function checkPauseRegulations(grossMinutes, pauseMinutes) {
  const warnings = [];
  
  // § 4 ArbZG: Pausenregelungen
  if (grossMinutes > 360 && grossMinutes <= 540) { // 6-9 Stunden
    if (pauseMinutes < 30) {
      warnings.push({
        type: 'pause-violation',
        message: '⚠️ Pausenregelung (§ 4 ArbZG): Bei 6-9 Stunden Arbeitszeit sind mindestens 30 Minuten Pause erforderlich. Sie haben ' + pauseMinutes + ' Minuten eingegeben.'
      });
    }
  } else if (grossMinutes > 540) { // über 9 Stunden
    if (pauseMinutes < 45) {
      warnings.push({
        type: 'pause-violation',
        message: '⚠️ Pausenregelung (§ 4 ArbZG): Bei mehr als 9 Stunden Arbeitszeit sind mindestens 45 Minuten Pause erforderlich. Sie haben ' + pauseMinutes + ' Minuten eingegeben.'
      });
    }
  }
  
  return warnings;
}

function checkMaximumWorkingTime(grossMinutes) {
  const warnings = [];
  const maxWorkingMinutes = 8 * 60; // 8 Stunden
  
  // § 3 ArbZG: Maximale Arbeitszeit
  if (grossMinutes > maxWorkingMinutes) {
    warnings.push({
      type: 'max-time-violation',
      message: '⚠️ Maximale Arbeitszeit (§ 3 ArbZG): Die maximale tägliche Arbeitszeit beträgt 8 Stunden. Sie haben ' + minutesToTimeFormat(grossMinutes) + ' eingegeben.'
    });
  }
  
  return warnings;
}

function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.add('show');
  document.getElementById('result-section').classList.remove('show');
}

function hideError() {
  document.getElementById('error-message').classList.remove('show');
}

function displayWarnings(warnings) {
  const warningsSection = document.getElementById('warnings-section');
  
  if (warnings.length === 0) {
    warningsSection.innerHTML = '';
    warningsSection.classList.remove('show');
    return;
  }
  
  let warningsHTML = '<div class="warnings-box">';
  warnings.forEach(warning => {
    warningsHTML += `<div class="warning-item">${warning.message}</div>`;
  });
  warningsHTML += '</div>';
  
  warningsSection.innerHTML = warningsHTML;
  warningsSection.classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  document.getElementById('start-time').value = '09:00';
  document.getElementById('end-time').value = '17:00';
  document.getElementById('break-time').value = '30';
  document.getElementById('additional-break').value = '0';
  
  setTimeout(() => {
    document.getElementById('calculator-form').dispatchEvent(new Event('submit'));
  }, 300);
});

document.getElementById('calculator-form').addEventListener('submit', (e) => {
  e.preventDefault();
  hideError();
  
  const startTime = document.getElementById('start-time').value;
  const endTime = document.getElementById('end-time').value;
  const breakTime = parseFloat(document.getElementById('break-time').value) || 0;
  const additionalBreak = parseFloat(document.getElementById('additional-break').value) || 0;
  
  // Validierung
  if (!startTime || !endTime) {
    showError('Bitte geben Sie Start- und Endzeit ein.');
    return;
  }
  
  if (breakTime < 0 || additionalBreak < 0) {
    showError('Pausenzeiten können nicht negativ sein.');
    return;
  }
  
  const startMinutes = timeStringToMinutes(startTime);
  const endMinutes = timeStringToMinutes(endTime);
  
  // Prüfe ob Endzeit nach Startzeit liegt
  if (endMinutes <= startMinutes) {
    showError('Die Endzeit muss nach der Startzeit liegen.');
    return;
  }
  
  // Berechne Bruttoarbeitszeit
  const grossWorkingMinutes = endMinutes - startMinutes;
  const totalPauseMinutes = breakTime + additionalBreak;
  
  // Prüfe ob Pausen größer als Arbeitszeit sind
  if (totalPauseMinutes >= grossWorkingMinutes) {
    showError('Die Gesamtpausenzeit kann nicht größer oder gleich der Arbeitszeit sein.');
    return;
  }
  
  // Berechne Nettoarbeitszeit
  const netWorkingMinutes = grossWorkingMinutes - totalPauseMinutes;
  
  // Anzeige der Ergebnisse
  document.getElementById('gross-working-time').textContent = minutesToTimeFormat(grossWorkingMinutes);
  document.getElementById('total-break-time').textContent = totalPauseMinutes + ' Min';
  document.getElementById('net-working-time').textContent = minutesToTimeFormat(netWorkingMinutes);
  
  // Überprüfe Pausenregelungen und maximale Arbeitszeit
  const warnings = [];
  warnings.push(...checkPauseRegulations(grossWorkingMinutes, totalPauseMinutes));
  warnings.push(...checkMaximumWorkingTime(grossWorkingMinutes));
  
  displayWarnings(warnings);
  
  document.getElementById('result-section').classList.add('show');
});

document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('calculator-form').reset();
  document.getElementById('result-section').classList.remove('show');
  document.getElementById('warnings-section').innerHTML = '';
  hideError();
  
  document.getElementById('start-time').value = '09:00';
  document.getElementById('end-time').value = '17:00';
  document.getElementById('break-time').value = '30';
  document.getElementById('additional-break').value = '0';
});
