

```
                         Client
                           │
                           ▼
                    ┌─────────────┐
                    │ API Gateway │
                    │    :3000    │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   Order Service     Payment Service   Inventory Service
      :3001              :3002              :3003
          │                │                  │
          ▼                ▼                  ▼
     order_db         payment_db         inventory_db
     PostgreSQL       PostgreSQL          PostgreSQL
          │                │                  │
          │                │                  │
          └────────────────┼──────────────────┘
                           │
                        Outbox
                           │
                           ▼
                     ┌───────────┐
                     │   Kafka   │
                     └─────┬─────┘
                           │
                           ▼
                  Notification Service
                           │
                           ▼
                    Email / WebSocket
```