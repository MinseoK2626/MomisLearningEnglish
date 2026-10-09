import {test} from 'node:test';
import assert from 'node:assert/strict';
import waitForPages from '../scripts/wait-for-pages.cjs';
const context={repo:{owner:'test',repo:'app'},sha:'abc'};
const core={info(){}};
test('Actions Pages source deploys immediately',async()=>{await waitForPages({context,core,github:{rest:{repos:{getPages:async()=>({data:{build_type:'workflow'}})}}},sleep:()=>assert.fail('should not wait')});});
test('legacy source waits until its source-file deployment finishes',async()=>{let calls=0,waits=0;await waitForPages({context,core,sleep:async()=>{waits++},github:{rest:{repos:{getPages:async()=>({data:{build_type:'legacy'}})},actions:{listWorkflowRunsForRepo:async args=>{assert.equal(args.head_sha,'abc');calls++;return {data:{workflow_runs:calls===1?[]:[{name:'pages build and deployment',event:'dynamic',status:calls===2?'in_progress':'completed'}]}};}}}}});assert.equal(calls,3);assert.equal(waits,2);});
test('missing branch-based run fails with a concrete fix rather than silently racing',async()=>{await assert.rejects(waitForPages({context,core,sleep:async()=>{},github:{rest:{repos:{getPages:async()=>({data:{build_type:'legacy'}})},actions:{listWorkflowRunsForRepo:async()=>({data:{workflow_runs:[]}})}}}}),/Source to GitHub Actions/);});
