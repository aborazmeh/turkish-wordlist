const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

const alphabet = "ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVYZ";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Charset": "ISO-8859-9,utf-8;q=0.7,*;q=0.3",
  "Accept-Encoding": "none",
  "Accept-Language": "en-US,en;q=0.8",
  Connection: "keep-alive",
};

async function readPage(letter) {
  const url = `http://tr.wiktionary.org/wiki/Vikisözlük:Sözcük_listesi_(${letter})`;

  try {
    const response = await axios.get(url, { headers });
    const content = response.data;
    const words = (content.match(/<li><a[^>]*>([^<]+)<\/a>/g) || []).map((word) => word.replace(/<[^>]+>/g, ""));
    words.pop();
    console.log(`Read the letter ${letter}`);
    return words;
  } catch (error) {
    console.error(`Error reading page for letter ${letter}:`, error);
    return [];
  }
}

async function getWordList() {
  const wordPromises = alphabet.split("").map((letter) => readPage(letter));
  const wordLists = await Promise.all(wordPromises);
  return wordLists.flat();
}

async function writeToFile(directory, filename) {
  const words = await getWordList();
  const filePath = path.join(directory, filename);

  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(filePath, words.join("\n"), "utf8");
}

writeToFile(path.join(__dirname, ".."), "wordlist.txt").catch((error) =>
  console.error("Error writing to file:", error),
);
