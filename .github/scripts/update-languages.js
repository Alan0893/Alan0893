const fs = require('fs');

const USERNAME = 'Alan0893';

const MANUAL = [
  'JavaScript/TypeScript', 'Python', 'Java', 'SQL',
  'Kotlin', 'C/C++', 'Bash', 'HTML/CSS',
];

const NORMALIZE = {
  'JavaScript':  'JavaScript/TypeScript',
  'TypeScript':  'JavaScript/TypeScript',
  'C':           'C/C++',
  'C++':         'C/C++',
  'Jupyter Notebook': null,
  'Makefile':    null,
  'Dockerfile':  null,
  'Shell':       'Bash',
  'Go Template': null,
  'Jinja':       null,
  'Mako':        null,
  'SCSS':        null,
  'HCL':         null,
  'Smarty':      null,
  'EJS':         null,
  'Mustache':    null,
  'Handlebars':  null,
  'Starlark':    null,
  'Procfile':    null,
};

async function fetchLanguages() {
  const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  });
  const repos = await res.json();

  const seen = new Set();
  await Promise.all(repos.map(async (repo) => {
    const r = await fetch(repo.languages_url, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    const langs = await r.json();
    for (const lang of Object.keys(langs)) {
      if (lang in NORMALIZE) {
        if (NORMALIZE[lang]) seen.add(NORMALIZE[lang]);
      } else {
        seen.add(lang);
      }
    }
  }));

  return [...seen];
}

async function main() {
  const detected = await fetchLanguages();

  const merged = new Set(MANUAL);
  for (const lang of detected) {
    merged.add(lang);
  }

  const ordered = [...merged];
  const line = ordered.join(' | ');
  const block = `<!-- LANGUAGES:START -->\n#### Languages\n${line}\n<!-- LANGUAGES:END -->`;

  const readme = fs.readFileSync('README.md', 'utf8');
  const updated = readme.replace(
    /<!-- LANGUAGES:START -->[\s\S]*?<!-- LANGUAGES:END -->/,
    block
  );
  fs.writeFileSync('README.md', updated);

  const newLangs = detected.filter(l => !MANUAL.includes(l));
  if (newLangs.length) {
    console.log('New languages added:', newLangs.join(', '));
  } else {
    console.log('No new languages detected');
  }
  console.log('Final list:', ordered.join(', '));
}

main();
