let arr = ["C#", "Avalonia", "HTML","CSS","Git"]
let skills = document.getElementById("skills")
arr.forEach((item) => {
    let card = document.createElement("div") 
    card.classList.add("skill-tag")
    card.innerHTML = `${item}`
    skills.appendChild(card)
})

document.getElementById('copyMail').addEventListener('click', async () => {
  const text = document.getElementById('copyMail').textContent;

  try {
    await navigator.clipboard.writeText(text);
    alert('Текст скопирован в буфер обмена!');
  } catch (err) {
    console.error('Ошибка при копировании: ', err);
    alert('Не удалось скопировать текст');
  }
});


function switchLanguage(){
  const isRu = document.documentElement.lang === `ru`;
  const newLang = isRu ? `en` : `ru`;

  document.querySelectorAll(`[data-ru][data-en]`).forEach(el =>{el.textContent = el.getAttribute(`data-${newLang}`)});
  document.documentElement.lang = newLang;

 const flagimg = document.querySelector(`.langToggle img`);
 if(`flagimg`){
  if(newLang === `ru`){
    flagimg.scr = "https://avatars.mds.yandex.net/get-entity_search/118194/224019704/S600xU_2x"
    flagimg.alt = "RU"
  }
  else{
    flagimg.scr = "https://img.freepik.com/premium-vector/british-flag-original-colors-proportions-vector-illustration-eps-10_148553-484.jpg?semt=ais_hybrid&w=740&q=80"
    flagimg.alt = "EN"
  }
 }
}

document.querySelector(`.langToggle`).addEventListener(`click`, switchLanguage);