document.addEventListener('DOMContentLoaded', () => {
  console.log('AJAX URL' + my_ajax.ajaxurl)
  const form = document.querySelector('#multi-step-form');
  if (!form) return;

  let currentStep = 1;  // Початковий крок
  const steps = document.querySelectorAll('.form-step');

  // Показуємо поточний крок
  function showStep(step) {
    steps.forEach((stepDiv, index) => {
      stepDiv.style.display = (index + 1 === step) ? 'block' : 'none';
    });
  }

  // Обробка кнопок для переходу між кроками
  form.addEventListener('click', (e) => {
    const button = e.target;
    if (button.matches('[id^="next-step"]')) {
      e.preventDefault();
      if (currentStep < steps.length) {
        currentStep++;
        showStep(currentStep);
      }
    }

    if (button.matches('[id^="prev-step"]')) {
      e.preventDefault();
      if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
      }
    }
  });

  // Показуємо перший крок
  showStep(currentStep);

  // Відправка форми через AJAX
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append('action', 'submit_multistep_form');


    try {
      const response = await fetch(my_ajax.ajaxurl, {
        method: 'POST',
        body: formData,
      });

      console.log(formData);

      const result = await response.json();

      if (result.success) {
        // Показати повідомлення про успіх на сторінці
        const message = document.getElementById('form-message');
        message.style.display = 'block';  // Показати повідомлення
        form.reset();  // Очистити форму після успіху

        // Повертаємо форму до першого кроку після успішної відправки
        currentStep = 1;
        showStep(currentStep);
      } else {
        alert('Помилка: ' + result.data);
      }
    } catch (error) {
      alert('Помилка: не вдалося відправити форму');
      console.error(error);
    }
  });
});
