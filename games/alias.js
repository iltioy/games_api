const words = ["яблоко", "планета", "молоко", "росток", "кнопка"];

function shuffleArray(array) {
    var tempArray = array.slice();
    for (var i = tempArray.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = tempArray[i];
        tempArray[i] = tempArray[j];
        tempArray[j] = temp;
    }

    return tempArray;
}

const generateWords = () => {
    const shuffledWords = shuffleArray(words);

    return shuffledWords;
};

module.exports = { generateWords };
