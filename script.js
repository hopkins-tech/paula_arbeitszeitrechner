const defaultConfig = {
  main_title: "Feiertagszuschlagsrechner",
  subtitle: "Berechnen Sie Ihren Lohn mit Feiertagszuschlag",
  calculate_button: "Berechnen",
  reset_button: "Zurücksetzen"
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('hourly-wage').value = '15';
  document.getElementById('holiday-percentage').value = '40';
  document.getElementById('holiday-hours').value = '8';

  setTimeout(() => {
    document.getElementById('calculator-form')
      .dispatchEvent(new Event('submit'));
  }, 300);
});

document.getElementById('calculator-form').addEventListener('submit', (e) => {
  e.preventDefault();
  hideError();

  const hourlyWage = parseFloat(document.getElementById('hourly-wage').value);
  const percentage = parseFloat(document.getElementById('holiday-percentage').value);
  const hours = parseFloat(document.getElementById('holiday-hours').value);

  if (hourlyWage <= 0 || percentage < 0 || hours <= 0) {
    showError('Bitte gültige Werte eingeben.');
    return;
  }

  const total = hourlyWage * hours * ((100 + percentage) / 100);

  document.getElementById('final-amount').textContent = formatCurrency(total);
  document.getElementById('result-section').classList.add('show');
});

document.getElementById('reset-btn').addEventListener('click', () => {
  document.getElementById('calculator-form').reset();
  document.getElementById('result-section').classList.remove('show');
  hideError();
});
