# 工单系统云函数（wo_*）说明

## 返回格式

所有函数统一返回：

```json
{ "ok": true, "data": { ... } }
```

或

```json
{ "ok": false, "error": { "code": "...", "message": "...", "details": { ... } } }
```

## 关键逻辑

- RBAC：主管全局；销售仅本人创建；工程师仅本人被指派。
- 状态机：`DRAFT -> ASSIGNED -> IN_PROGRESS -> WAIT_APPROVAL -> APPROVED`，`REJECTED -> IN_PROGRESS`。
- 写入审计：所有写操作写 `audit_logs`。
- 费用合计：`expenseTotal` 由 `travelExpenses` 自动计算。
- 评分 token：随机、一次性、支持过期。

## 可测试调用示例

> 在小程序中使用 `wx.cloud.callFunction`。示例：

```js
wx.cloud.callFunction({
  name: 'wo_create',
  data: {
    title: '客户现场支持',
    description: '网络故障排查',
    customer: '某客户',
    backupDone: true,
    travelExpenses: [{ date: '2024-01-01', amount: 100, description: '交通', receipts: [] }]
  }
});
```

```js
wx.cloud.callFunction({
  name: 'wo_assign',
  data: { workOrderId: 'xxx', assigneeId: 'engineerUserId' }
});
```

```js
wx.cloud.callFunction({
  name: 'wo_score_token_create',
  data: { workOrderId: 'xxx' }
});
```
