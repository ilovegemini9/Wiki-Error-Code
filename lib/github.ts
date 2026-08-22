export async function commitFileToRepo(path: string, content: string, message: string) {
  const token = process.env.GITHUB_TOKEN || process.env.SETTINGS_REPO_WRITE_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN or SETTINGS_REPO_WRITE_TOKEN is required to commit files to the repo. Set it in your environment variables.');

  const owner = 'ilovegemini9';
  const repo = 'Wiki-Error-Code';
  const api = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

  // Try to get existing file to obtain sha
  const getRes = await fetch(api, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  });

  let sha: string | undefined;
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  const putBody: any = {
    message,
    content: Buffer.from(content).toString('base64'),
    committer: {
      name: 'site-updater',
      email: 'noreply@github.com'
    }
  };
  if (sha) putBody.sha = sha;

  const putRes = await fetch(api, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(putBody)
  });

  if (!putRes.ok) {
    const txt = await putRes.text();
    throw new Error(`GitHub commit failed: ${putRes.status} ${txt}`);
  }

  return await putRes.json();
}
