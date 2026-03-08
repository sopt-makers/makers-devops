## Makers Devops

SOPT Makers 팀의 DevOps 자동화 서버들을 관리하는 pnpm 모노레포입니다.

## 구조

```
servers/
  mumu/   # GitHub 이벤트를 받아 Slack으로 알림을 전달하는 웹훅 서버
```

### mumu

GitHub Webhook을 수신해 PR 생성, 리뷰 코멘트 등의 이벤트를 Slack 채널에 알림으로 전달합니다. Express 기반으로 동작하며 `@octokit/webhooks`, `@slack/web-api`를 사용합니다.

## 기술 스택

- **Runtime**: Node.js + TypeScript
- **Package Manager**: pnpm (workspace)
- **Linter / Formatter**: Biome
- **Git Hooks**: Husky + lint-staged

## 기여

PR 생성 시 `create-devops-pr` 스킬을 활용할 수 있습니다.
devops 모노레포 내 변경사항에 적합한 PR을 자동 생성합니다.

스킬 이름을 그대로 입력하거나, "PR 생성해줘"와 같이 요청 가능합니다.
