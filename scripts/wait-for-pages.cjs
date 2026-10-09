// A branch-based Pages deployment can overwrite our compiled app with source files.
// Until Pages is switched to Actions, deploy our artifact only after that run finishes.
module.exports = async ({ github, context, core, sleep = ms => new Promise(r => setTimeout(r, ms)) }) => {
  const repo = { owner: context.repo.owner, repo: context.repo.repo };
  const { data: pages } = await github.rest.repos.getPages(repo);
  if (pages.build_type !== 'legacy') return;
  core.info('Waiting for the branch-based Pages deployment before publishing the compiled app.');
  for (let attempt = 0; attempt < 36; attempt++) {
    const { data } = await github.rest.actions.listWorkflowRunsForRepo({ ...repo, head_sha: context.sha, per_page: 100 });
    const runs = data.workflow_runs.filter(run => run.event === 'dynamic' && run.name === 'pages build and deployment');
    if (runs.length && runs.every(run => run.status === 'completed')) {
      core.info('Branch-based deployment finished; the compiled app will be published last.');
      return;
    }
    await sleep(10000);
  }
  throw new Error('The branch-based Pages deployment has not finished. Set Settings → Pages → Source to GitHub Actions, then rerun this workflow.');
};
