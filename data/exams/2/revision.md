---
title: Day 2 — 65 Question Revision Guide
number: 2
pointCount: 65
---

Use this guide like flash cards: read the situation, hide the solution, and recall the reasoning. Numbered points follow the question order in Exam 2; source question IDs are 66–130.

## Day 2 — 65 Question Revision Guide

1. **Frequently accessed S3 objects become rare after 30 days, but must remain immediately available for four years → S3 Standard, then S3 Standard-IA using Lifecycle.**
   Logic: Standard suits frequent initial access; Standard-IA lowers storage cost for infrequent access while retaining immediate retrieval. Delete after the required retention period.
   **Remember:** Rare access + immediate retrieval → consider Standard-IA; account for retrieval and minimum-duration charges.

2. **SQS messages sometimes create duplicate RDS records → extend visibility timeout to cover processing, and make the database operation idempotent.**
   Logic: A message can become visible before its first processing completes. Extending the timeout reduces that risk, but at-least-once delivery can still produce duplicates.
   **Trap:** The source answer says increasing visibility ensures once-only processing. It does not: enforce idempotency or deduplication at the application/database boundary. [AWS documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html).

3. **Hybrid connection needs consistent primary performance and a cheaper, slower backup → Direct Connect with Site-to-Site VPN backup.**
   Logic: Direct Connect provides dedicated connectivity; VPN gives an alternative path without a second dedicated connection.
   **Remember:** Dedicated primary + lower-cost backup → Direct Connect + VPN. Check redundancy and failover requirements.

4. **Critical EC2 application and Aurora PostgreSQL need high availability with little management → distribute EC2 across AZs, use an Aurora replica in another AZ, and consider RDS Proxy.**
   Logic: Multiple AZs protect the application tier; an Aurora replica provides a failover target. RDS Proxy helps applications manage database connections during failover.
   **Remember:** HA needs redundancy in both the application and database tiers.

5. **Unhealthy HTTP application instances should be replaced automatically → configure HTTP health checks and enable load balancer health checks in the Auto Scaling group.**
   Logic: An application health endpoint can expose failures that a simple TCP check misses; Auto Scaling can replace instances marked unhealthy.
   **Trap:** The source explanation incorrectly says an NLB cannot perform HTTP health checks. NLB target groups support HTTP and HTTPS health checks; an ALB is not required solely for that purpose. [AWS documentation](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/target-group-health-checks.html).

6. **Recover a DynamoDB table after corruption → enable point-in-time recovery and restore to a new table.**
   Logic: Continuous backups allow recovery to an available point before the corruption.
   **Trap:** PITR alone does not guarantee a one-hour recovery time. Restore duration varies; test the restore and application cutover against the RTO. [AWS documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/pointintimerecovery_restores.html).

7. **Private application frequently accesses S3 in the same Region and incurs NAT-related costs → use an S3 gateway VPC endpoint.**
   Logic: The gateway endpoint routes supported S3 traffic without a NAT gateway or internet gateway; an endpoint policy can restrict access.
   **Remember:** VPC to same-Region S3 → consider a gateway endpoint and its route tables.

8. **SSH from an on-premises network through a public bastion to private Linux instances → allow SSH from the company's public IP range to the bastion and from the bastion to the application instances.**
   Logic: Restrict each inbound hop to its actual source; the source option uses the bastion's private IP for the second hop.
   **Remember:** Office public IP → bastion; bastion private IP or security group → private hosts.

9. **Public web tier connects securely to SQL Server on EC2 → allow inbound HTTPS to the web security group and SQL Server traffic from the web security group to the database security group.**
   Logic: The database does not need public access; referencing the web tier limits which instances can initiate database connections.
   **Remember:** Internet → web on 443; web security group → database on 1433.

10. **REST application tiers drop transactions when overloaded and should be modernized with low operations → API Gateway + Lambda, with SQS between asynchronous services.**
    Logic: SQS buffers work during load spikes; managed serverless components reduce infrastructure management.
    **Remember:** Bursty asynchronous work → queue between producer and consumer; design for retries and idempotency.

11. **Transfer 10 TB of sensitive on-premises data daily for near-real-time S3 analytics → AWS DataSync over Direct Connect.**
    Logic: DataSync manages and verifies transfers; Direct Connect provides dedicated connectivity. Confirm throughput, scheduling, and encryption requirements.
    **Remember:** Managed recurring transfer from on-premises storage → DataSync.

12. **Managed real-time ingestion with transformation and S3 storage → API Gateway → Kinesis Data Streams → Data Firehose with Lambda transformation → S3.**
    Logic: The managed services ingest, transform, and deliver data without operating a processing cluster.
    **Remember:** Streams ingests; Firehose delivers; Lambda transforms.

13. **Retain DynamoDB backups for seven years with low operational overhead → AWS Backup schedules and retention policies.**
    Logic: Backup plans automate creation and retention of recovery points.
    **Remember:** Long-term managed backup retention → AWS Backup.

14. **DynamoDB workload has idle mornings and sudden unpredictable evening spikes → on-demand capacity.**
    Logic: On-demand mode scales request capacity automatically without advance provisioning.
    **Remember:** Unpredictable database traffic → consider DynamoDB on-demand.

15. **Share an encrypted EBS-backed AMI with one partner account → grant that account AMI launch permission and access to the customer managed KMS key.**
    Logic: The partner needs permission to use both the image and the key protecting its snapshots.
    **Remember:** Encrypted AMI sharing → launch permission + KMS permissions.

16. **Stateless workers process variable numbers of durable jobs → SQS + EC2 Auto Scaling.**
    Logic: The queue decouples producers from workers; scale worker capacity in response to backlog.
    **Remember:** Variable job backlog → queue + scalable worker fleet.

17. **Imported ACM certificates require an expiry warning 30 days ahead → AWS Config certificate-expiration rule + EventBridge + SNS.**
    Logic: Config evaluates certificate compliance; events can trigger notifications.
    **Remember:** Imported certificates need expiration monitoring and replacement.

18. **Accelerate a website for users in Europe while its origin stays on-premises in the US → CloudFront with the on-premises server as custom origin.**
    Logic: Edge delivery can cache eligible content and improve the route to the origin; truly dynamic responses still require origin processing.
    **Remember:** Existing HTTP origin + global audience → consider CloudFront.

19. **Production EC2 runs continuously; development and test stop when idle → Reserved Instances for steady production and On-Demand for intermittent environments.**
    Logic: Commitments suit predictable usage; On-Demand avoids paying for stopped test instances' compute hours. Right-size the underused instances too.
    **Remember:** Stable baseline → commitment; intermittent usage → evaluate On-Demand.

20. **Documents must not be modified or deleted after upload → S3 Versioning + Object Lock.**
    Logic: Object Lock protects object versions for a retention period or legal hold. Choose the retention mode required by the regulation.
    **Remember:** S3 write-once retention → Object Lock.

21. **Web servers need database credentials with frequent rotation → Secrets Manager + IAM permissions for the servers.**
    Logic: Secrets Manager stores credentials and supports managed rotation; an instance role grants retrieval permissions.
    **Remember:** Database secret + rotation → Secrets Manager.

22. **Keep customer data during Aurora upgrades → place events in SQS and process them with a Lambda consumer when the database is available.**
    Logic: The queue buffers data while the database is unavailable; retries must be configured and processing must be idempotent.
    **Remember:** Temporary downstream outage → durable queue + retry.

23. **Share an S3 dataset while minimizing the bucket owner's transfer charges → Requester Pays.**
    Logic: Eligible requesters pay request and data transfer charges instead of the bucket owner; requesters must acknowledge charges.
    **Remember:** Shift eligible S3 access costs to requester → Requester Pays.

24. **Protect audit documents from accidental S3 deletion → Versioning + MFA Delete.**
    Logic: Versioning preserves versions; MFA Delete adds protection for permanent version deletion and versioning-state changes.
    **Remember:** Accidental deletion → versioning; stronger retention requirements may call for Object Lock.

25. **Reporting queries slow the primary RDS database → route the report to an RDS read replica.**
    Logic: A read replica offloads read traffic, though replication lag can make results slightly stale.
    **Remember:** Read scaling and isolation → read replica; failover → Multi-AZ.

26. **EC2 must call S3 without traffic traversing the internet → S3 gateway VPC endpoint.**
    Logic: Route-table entries direct supported S3 traffic through the endpoint.
    **Remember:** Private S3 access from a VPC → gateway endpoint.

27. **Secure S3 access from an EC2 application tier → S3 gateway endpoint + restrictive bucket policy.**
    Logic: The endpoint provides a private network path; the bucket policy limits authorized access. IAM permissions are also required.
    **Remember:** Network path and authorization solve different problems.

28. **Read-heavy MySQL production workload and frequent staging copies cause delays → Aurora MySQL replicas + database cloning.**
    Logic: Replicas offload reads and improve availability; cloning quickly creates a separate staging database using copy-on-write storage.
    **Remember:** Aurora reads → replicas; rapid database copy → clone.

29. **Small S3 uploads need rapid, variable-volume transformation → S3 event notification + SQS + Lambda.**
    Logic: A queue buffers upload events for serverless workers; save the transformed output in the storage service required by the application.
    **Remember:** S3 event → queue → Lambda; handle duplicate events and retries.

30. **Separate RDS MySQL read traffic from writes quickly → create read replicas and direct read queries to them.**
    Logic: The primary handles writes while replicas serve suitable read workloads.
    **Remember:** Read replicas reduce read load; allow for replication lag.

31. **IAM policy effect depends on its actual statements and conditions → source review required (source question 96).**
    Logic: The extracted question omits the policy, so its effect cannot be determined from the available text.
    **Remember:** Read both the action and all conditions before interpreting an IAM policy.

32. **Highly available Windows shared files with Active Directory → FSx for Windows File Server.**
    Logic: It provides managed Windows file shares and AD integration; choose a Multi-AZ deployment for availability.
    **Remember:** Windows SMB + Active Directory → FSx for Windows.

33. **SQS-triggered Lambda sends duplicate emails → configure visibility timeout and make the email operation idempotent.**
    Logic: Longer visibility reduces premature retries but standard SQS and Lambda are at-least-once; duplicates remain possible.
    **Trap:** The supplied answer alone does not guarantee one email per upload. AWS recommends allowing at least six times the function timeout plus the batching window and using idempotent processing.

34. **Managed Lustre file system for on-premises clients → FSx for Lustre with supported private connectivity.**
    Logic: FSx manages the Lustre file system while clients connect through the network.
    **Remember:** Managed high-performance Lustre → FSx for Lustre.

35. **Encrypt application data with managed keys and store it durably → KMS customer managed key + S3.**
    Logic: Grant the EC2 role only needed key permissions; use envelope encryption for data larger than KMS direct-encryption limits.
    **Remember:** KMS manages keys; S3 stores objects.

36. **Private subnets in three AZs need resilient outbound IPv4 internet access → one NAT gateway per AZ with local routes.**
    Logic: An AZ-local NAT gateway avoids a single gateway becoming a cross-AZ dependency; the gateways reside in public subnets.
    **Remember:** Private IPv4 outbound internet → NAT gateway; public subnet → internet gateway.

37. **Move an on-premises NFS dataset to EFS with managed transfer → deploy a DataSync agent and configure source and destination locations.**
    Logic: DataSync reads from the on-premises NFS location and transfers to EFS.
    **Remember:** On-premises NFS → DataSync agent → EFS.

38. **Glue ETL should process only new supported S3 inputs on later runs → enable job bookmarks.**
    Logic: Bookmarks track processing state; verify the source format and job configuration support bookmarks.
    **Remember:** Incremental Glue ETL → job bookmarks.

39. **Protect a highly available website from large DDoS attacks → Shield Advanced + CloudFront.**
    Logic: CloudFront distributes traffic at edge locations; Shield Advanced adds enhanced DDoS protection.
    **Remember:** Global web protection → CloudFront + Shield.

40. **Allow an EventBridge rule to invoke Lambda → Lambda resource-based policy grants events.amazonaws.com lambda:InvokeFunction.**
    Logic: Restrict the permission to the intended rule with the source ARN.
    **Remember:** Who can invoke Lambda? → function resource policy.

41. **S3 encryption requires auditable key use and annual key rotation → SSE-KMS with an eligible customer managed key and automatic rotation.**
    Logic: KMS key operations are auditable through CloudTrail; configure the key and rotation appropriately.
    **Remember:** S3 encryption + key-use audit → SSE-KMS.

42. **Expose location data through a REST API with managed application logic → API Gateway + Lambda.**
    Logic: API Gateway provides the endpoint and Lambda runs the application logic; select a suitable data store separately.
    **Remember:** Managed REST endpoint → API Gateway + Lambda.

43. **Send a sale event to multiple downstream systems → publish an application or change-data-capture event to SNS and fan out to SQS queues.**
    Logic: Separate queues buffer work for independent consumers.
    **Trap:** The supplied answer uses RDS event notifications, which report RDS infrastructure events, not individual application row changes. Use an application event or suitable database change-data capture instead.

44. **Protect S3 object versions for an unknown duration → Object Lock legal hold.**
    Logic: A legal hold stays in place until an authorized user removes it; versioning is required.
    **Remember:** Indefinite hold → legal hold; deletion also requires appropriate permissions.

45. **Make image uploads faster and loosely coupled → upload originals to S3 and invoke Lambda from an S3 event to resize them.**
    Logic: Processing happens asynchronously after upload rather than during the web request.
    **Remember:** S3 upload → event → Lambda transformation.

46. **Make an ActiveMQ pipeline highly available with low management → Amazon MQ active/standby + multi-AZ consumer Auto Scaling + RDS Multi-AZ.**
    Logic: Each tier gains redundancy while managed broker and database services reduce administration.
    **Remember:** HA needs redundancy across broker, workers, and database.

47. **Move a containerized web app to AWS with minimal server management → ECS on Fargate + service Auto Scaling + ALB.**
    Logic: Fargate runs containers without managing EC2 worker hosts; the load balancer distributes requests.
    **Remember:** Containers + low operations → ECS with Fargate.

48. **Move 50 TB with no available network bandwidth and continue transformation in AWS → Snowball Edge + AWS Glue.**
    Logic: A physical transfer avoids network bandwidth constraints; Glue provides managed data transformation.
    **Remember:** Large offline migration → Snowball; managed ETL → Glue.

49. **Photo processing must scale with varying demand → S3 for images, Lambda for processing, DynamoDB for metadata.**
    Logic: Event-driven functions scale with requests and S3 stores image objects.
    **Remember:** Images → S3; metadata → DynamoDB; processing → Lambda.

50. **EC2 must access S3 without internet routing → S3 gateway endpoint and suitable route-table association.**
    Logic: The endpoint provides an AWS network path. Private subnets can reduce exposure, but a gateway endpoint can also be used from a public subnet.
    **Remember:** S3 private VPC path → gateway endpoint.

51. **Rarely updated static website needs scalable HTTPS with little maintenance → S3 static website + CloudFront.**
    Logic: S3 hosts static content; CloudFront provides HTTPS to viewers. An S3 website endpoint is an HTTP-only custom origin.
    **Remember:** Static website → S3 + CloudFront; choose the origin configuration deliberately.

52. **Send CloudWatch Logs to OpenSearch in near real time → configure a CloudWatch Logs subscription.**
    Logic: The subscription forwards matching log events using a supported delivery integration.
    **Remember:** Near-real-time log streaming → CloudWatch Logs subscription.

53. **Store 900 TB of documents with scalable access and cost efficiency → Amazon S3.**
    Logic: Object storage scales without managing file servers; select storage classes based on access needs.
    **Remember:** Large scalable object repository → S3.

54. **Protect regional API Gateway REST APIs across accounts from SQL injection and XSS → centrally manage AWS WAF policies with Firewall Manager.**
    Logic: WAF inspects web requests; Firewall Manager manages policies across organization accounts and Regions.
    **Remember:** Web attack rules → WAF; organization-wide management → Firewall Manager.

55. **Route global DNS service traffic to NLBs in two Regions → Global Accelerator with regional endpoint groups.**
    Logic: The accelerator directs supported TCP/UDP traffic to healthy regional endpoints.
    **Remember:** Global TCP/UDP routing → Global Accelerator.

56. **Encrypt an existing unencrypted RDS database → copy a snapshot with encryption and restore a new DB instance.**
    Logic: Encryption is set when creating the restored instance; validate cutover and backup requirements.
    **Remember:** Unencrypted RDS → encrypted snapshot copy → restore.

57. **Provide developers with managed encryption keys → AWS KMS.**
    Logic: KMS manages keys and controls their use through IAM and key policies.
    **Remember:** Managed application key infrastructure → KMS.

58. **EC2 web servers spend too much CPU on TLS termination → import the certificate into ACM and terminate HTTPS at an ALB.**
    Logic: The load balancer handles client TLS connections, reducing work on the web instances.
    **Remember:** Offload HTTPS termination → ALB + ACM certificate.

59. **Stateless batch jobs tolerate interruption and need low-cost EC2 capacity → Spot Instances.**
    Logic: Spot uses spare capacity at a discount but can be interrupted; design retries and checkpointing accordingly.
    **Remember:** Interruptible batch compute → Spot.

60. **Private web and database tiers need outbound payment-service access and high availability → source review required (source question 125).**
    Logic: The extracted answer and option labels are inconsistent. The architecture needs private instances and database, resilient outbound NAT, and an appropriately placed load balancer, but the missing choice cannot be reliably identified.
    **Remember:** Private IPv4 egress → NAT; use multiple AZs for availability.

61. **Keep S3 data at least 25 years, with the newest two years immediately accessible → transition older objects to Glacier Deep Archive using Lifecycle.**
    Logic: Deep Archive reduces long-term storage cost but retrieval is not immediate.
    **Remember:** Immediate access now; long-term archive later → Lifecycle transition.

62. **Need maximum I/O for disposable processing, durable media storage, and archival → instance store + S3 + S3 Glacier storage classes.**
    Logic: Instance store is ephemeral; S3 stores durable objects and archive classes trade retrieval speed for lower storage cost.
    **Remember:** Fast scratch → instance store; durable objects → S3; archive → Glacier class.

63. **Stateless containers tolerate interruption and need lower cost → EKS managed node group with Spot Instances.**
    Logic: Spot lowers compute costs for interruption-tolerant workloads; managed node groups reduce node lifecycle management.
    **Remember:** Spot containers require disruption-aware design.

64. **Reduce operations for containerized web app and PostgreSQL database → ECS on Fargate + Aurora PostgreSQL.**
    Logic: Fargate removes server management; Aurora is a managed relational database. Plan migration and compatibility.
    **Remember:** Managed containers + managed PostgreSQL-compatible database → Fargate + Aurora.

65. **Keep Auto Scaling fleet CPU near 40% → target tracking scaling policy.**
    Logic: Target tracking adds or removes capacity to keep the selected metric near the target.
    **Remember:** Maintain a metric around a target → target tracking.

---

## The patterns I want you to memorize

**Rare S3 access with immediate retrieval → consider Standard-IA**

**SQS duplicate effects → idempotent consumer; visibility timeout reduces premature retries**

**Dedicated hybrid connection with lower-cost backup → Direct Connect + VPN**

**Application availability → health checks + automatic replacement across AZs**

**DynamoDB recovery → PITR restores to a new table; test the RTO**

**Private VPC access to S3 → gateway endpoint**

**Database access → permit the application security group**

**Overloaded asynchronous services → SQS buffering**

**Multi-AZ application and database tiers → availability across failures**

**DynamoDB unpredictable traffic → on-demand capacity**

**Windows shared files + Active Directory → FSx for Windows**

**Event fan-out → SNS + separate SQS queues**

**Long-term retention → AWS Backup or an appropriate S3 archive class**

**S3 object retention → Object Lock or legal hold**

**Steady compute → evaluate a commitment; interruptible batch → Spot**

**Global web delivery → CloudFront; global TCP/UDP routing → Global Accelerator**

**Database read scaling → read replicas; failover → Multi-AZ**
