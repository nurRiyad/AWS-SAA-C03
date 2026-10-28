---
title: Day 1 — 65 Question Revision Guide
number: 1
pointCount: 65
---

Absolutely. For revision, don’t reread all 65 full questions. Read the **decision rule behind each question**. That is what AWS keeps testing with different wording.

Use this guide like flash cards: read the situation, hide the AWS service name, and try to recall it yourself.

## Day 1 — 65 Question Revision Guide

1. **Global sites uploading huge files to one S3 bucket → S3 Transfer Acceleration + Multipart Upload.**
   Logic: Fast internet already exists, so use AWS edge network to speed long-distance S3 uploads.
   **Remember:** Global upload → Transfer Acceleration. Huge file → Multipart.

2. **Simple SQL queries on files already in S3 → Amazon Athena.**
   Logic: Don’t move data into a database if you only need occasional SQL queries. Athena queries S3 directly and is serverless.
   **Remember:** `S3 + SQL + on-demand = Athena`.

3. **Allow access from every account in one AWS Organization → `aws:PrincipalOrgID`.**
   Logic: One condition automatically covers existing and future accounts in the organization.
   **Trap:** `PrincipalOrgPaths` is for specific OUs, not the whole organization.

4. **EC2 needs private access to S3 without internet → S3 Gateway VPC Endpoint.**
   Logic: IAM gives permission; VPC endpoint gives network connectivity.
   **Remember:** `Private VPC → S3/DynamoDB = Gateway Endpoint`.

5. **Multiple EC2 instances need the same files → Amazon EFS.**
   Logic: EBS belongs mainly to one EC2/AZ. EFS is a shared network file system.
   **Remember:** `Many Linux EC2 → same files = EFS`.

6. **Move tens of TB to AWS while using almost no network bandwidth → Snowball Edge.**
   Logic: Physically ship the data rather than transferring it over the internet.
   **Remember:** Huge one-time migration + limited bandwidth → Snowball.

7. **One message must go to many independent applications → SNS + SQS fan-out.**
   Logic: SNS copies the event; each consumer gets its own SQS queue.
   **Remember:** `One producer → many consumers = SNS → SQS`.

8. **Workers process jobs from a variable backlog → SQS + Auto Scaling based on queue depth.**
   Logic: Scale based on how much work is waiting, not only CPU.
   **Remember:** Worker fleet → queue size is the best scaling signal.

9. **Extend on-prem file storage into S3 while keeping file access → S3 File Gateway.**
   Logic: Gateway keeps the familiar file interface and caches recent data locally. S3 Lifecycle handles old files.
   **Remember:** On-prem files + cloud extension → File Gateway.

10. **Messages/orders must be processed in exact order → SQS FIFO.**
    Logic: Standard SQS does not guarantee strict ordering.
    **Remember:** Ordered queue → FIFO.

11. **Database passwords must be managed and rotated automatically → Secrets Manager.**
    Logic: Secrets Manager is built for credentials and rotation.
    **Remember:** Secret + automatic rotation → Secrets Manager.

12. **Global website has static S3 content and dynamic ALB content → one CloudFront distribution with multiple origins.**
    Logic: CloudFront can route different paths to S3 and ALB.
    **Remember:** Global HTTP content → CloudFront.

13. **Database credentials needed across multiple Regions with rotation → Secrets Manager multi-Region replication.**
    Logic: Use the service already designed for secret replication and scheduled rotation.
    **Remember:** Multi-Region secrets → Secrets Manager replication.

14. **MySQL application is read-heavy and reads grow unpredictably → Aurora Replicas + Aurora Auto Scaling.**
    Logic: Scale read replicas automatically while keeping HA.
    **Remember:** Unpredictable DB reads → Aurora Auto Scaling replicas.

15. **Need actual network traffic inspection and filtering → AWS Network Firewall.**
    Logic: GuardDuty detects threats; Network Firewall sits in the path and filters traffic.
    **Remember:** Detect = GuardDuty. Block/filter network traffic = Network Firewall.

16. **Business dashboards with different access levels → QuickSight users and groups.**
    Logic: QuickSight controls dashboard sharing through its users/groups.
    **Remember:** BI visualization → QuickSight.

17. **EC2 needs access to S3 → attach an IAM Role to EC2.**
    Logic: Policies define permissions, but EC2 receives them through a role.
    **Remember:** `EC2 → AWS service = IAM Role`, not IAM user keys.

18. **S3 upload must be processed reliably by Lambda → S3 → SQS → Lambda.**
    Logic: SQS makes the workflow durable and buffers failures.
    **Remember:** Durable async processing → put SQS in the middle.

19. **Third-party firewall appliance must inspect traffic inline → Gateway Load Balancer.**
    Logic: GWLB is specifically designed for virtual firewalls and network appliances.
    **Remember:** Firewall appliance from Marketplace → GWLB.

20. **Create EBS volumes from snapshots and need full I/O immediately → Fast Snapshot Restore.**
    Logic: Normal restored volumes can have first-read initialization latency. FSR avoids that.
    **Remember:** Snapshot + immediate high performance → FSR.

21. **Millions of web requests, low latency, minimal management → S3 + CloudFront + API Gateway + Lambda + DynamoDB.**
    Logic: Prefer serverless services when the workload must scale massively with low operations.
    **Remember:** Static frontend + serverless backend.

22. **S3 access pattern is unpredictable → S3 Intelligent-Tiering.**
    Logic: AWS automatically moves data between cost tiers based on access.
    **Remember:** Don’t know future access pattern → Intelligent-Tiering.

23. **Files are frequently used for 1 month, then never used → Lifecycle to Glacier Deep Archive.**
    Logic: When access pattern is known, use a lifecycle rule instead of Intelligent-Tiering.
    **Remember:** Known long-term archive → Deep Archive.

24. **Analyze AWS costs historically with filters and graphs → Cost Explorer.**
    Logic: Budgets are for alerts; Cost Explorer is for investigation.
    **Remember:** Cost analysis → Cost Explorer. Cost alert → Budgets.

25. **Lambda receives bursts faster than Aurora can handle → decouple with SQS.**
    Logic: One Lambda receives, SQS buffers, another Lambda writes at a safe rate.
    **Remember:** Protect database from burst → queue.

26. **Detect unauthorized AWS resource configuration changes → AWS Config.**
    Logic: Config records resource configuration and evaluates compliance rules.
    **Remember:** Configuration state/history → Config.

27. **Someone without an AWS account needs only a CloudWatch dashboard → share the dashboard.**
    Logic: Don’t create IAM credentials if a built-in restricted sharing feature exists.
    **Remember:** Least privilege often means avoiding an AWS account entirely.

28. **Company keeps identities in on-prem Microsoft AD but needs AWS multi-account SSO → AWS SSO/Identity Center + Directory Service trust.**
    Logic from this question set: use the AD trust integration rather than creating separate AWS users.
    **Remember:** Existing AD + many AWS accounts → centralized SSO.

29. **UDP application across Regions needs lowest latency and automatic failover → NLB + Global Accelerator.**
    Logic: NLB supports UDP; Global Accelerator routes through AWS global network to healthy endpoints.
    **Remember:** `UDP + global = NLB + Global Accelerator`.

30. **RDS is used only 48 hours each month → snapshot, terminate, restore later.**
    Logic: Remove compute cost during the long unused period.
    **Remember:** Rarely used DB + long idle period → snapshot/restore can beat leaving it running.

31. **Ensure EC2/RDS/Redshift all have required tags → AWS Config rules.**
    Logic: Config can continuously evaluate resource tags without custom scripts.
    **Remember:** Compliance check across resources → Config.

32. **Website contains only HTML/CSS/JS/images → host in S3.**
    Logic: No server-side computation means you do not need EC2, Fargate, or Lambda.
    **Remember:** Static website → S3 (+ CloudFront if global).

33. **Millions of near-real-time events, multiple consumers, transform before storage → Kinesis Data Streams + Lambda + DynamoDB.**
    Logic: Kinesis Streams is designed for real-time stream consumers.
    **Remember:** Real-time stream that multiple apps consume → Kinesis Data Streams.

34. **Need resource configuration history AND API call history → Config + CloudTrail.**
    Logic:
    `Config = what changed in resource configuration`
    `CloudTrail = who called which AWS API`.

35. **Protect public application from large-scale DDoS attacks → AWS Shield Advanced.**
    Logic: GuardDuty/Inspector are not DDoS protection services.
    **Remember:** Serious DDoS protection → Shield Advanced.

36. **Same encryption key must work in multiple Regions → KMS Multi-Region Key.**
    Logic: Separate normal regional keys are not the same logical key.
    **Remember:** Same KMS key across Regions → Multi-Region key.

37. **Secure EC2 administration without bastion hosts or SSH key management → Systems Manager Session Manager.**
    Logic: Uses IAM-controlled sessions without opening SSH inbound access.
    **Remember:** Modern EC2 admin → Session Manager.

38. **Static S3 website must be faster globally → CloudFront.**
    Logic: CloudFront caches files near users.
    **Trap:** S3 Transfer Acceleration is mainly about accelerating transfer to/from S3, not replacing a CDN.

39. **RDS inserts are slow and storage I/O is confirmed bottleneck → Provisioned IOPS SSD.**
    Logic: Fix the component that is actually constrained.
    **Remember:** Storage bottleneck → storage upgrade, not bigger CPU/RAM.

40. **Massive continuous stream → managed ingestion → S3 → archive later → Firehose + S3 Lifecycle.**
    Logic: Firehose handles delivery without managing servers.
    **Remember:** Stream data directly into storage → Firehose.

41. **Move data from SaaS applications into AWS with low operational work → Amazon AppFlow.**
    Logic: AppFlow is purpose-built for SaaS data transfer.
    **Remember:** Salesforce/SaaS → AWS data integration = AppFlow.

42. **EC2 accesses S3 through NAT and NAT/data-transfer cost is high → S3 Gateway Endpoint.**
    Logic: S3 traffic does not need to go through NAT.
    **Remember:** If NAT is being used only for S3/DynamoDB, think Gateway Endpoint.

43. **On-prem continuously sends lots of data to AWS and internet is congested → Direct Connect.**
    Logic: Dedicated connection removes AWS traffic from normal internet bandwidth.
    **Remember:** Long-term private/dedicated hybrid connection → Direct Connect.

44. **Protect S3 objects from accidental deletion → Versioning + MFA Delete.**
    Logic: Versioning allows recovery; MFA Delete adds extra protection against permanent deletion.
    **Remember:** Accidental S3 delete → Versioning first.

45. **SNS-triggered processing sometimes fails and messages must never disappear → SNS → SQS → Lambda.**
    Logic: SQS provides durable buffering and retries.
    **Remember:** If asynchronous processing can fail, add a queue.

46. **Find PII inside S3 files with minimal development → Amazon Macie.**
    Logic: Macie is built for sensitive-data discovery in S3.
    **Remember:** `S3 + PII = Macie`.

47. **Need guaranteed EC2 capacity in specific Availability Zones → On-Demand Capacity Reservation.**
    Logic: Reserved Instances mainly provide pricing benefits; Capacity Reservations reserve capacity.
    **Remember:**
    RI = discount.
    Capacity Reservation = capacity guarantee.

48. **Instance Store contains important files and needs durability/HA → EFS.**
    Logic: Instance Store is ephemeral. EFS is persistent and multi-AZ.
    **Remember:** Never use Instance Store as durable primary storage.

49. **Newer S3 files need quick access, old files can be slower → tier storage by age/access.**
    Logic from this question: Intelligent-Tiering for the active period, then Glacier Flexible Retrieval after one year.
    **Remember:** Match storage tier to retrieval requirement, not only cheapest price.

50. **Urgently run a custom third-party patch across 1,000 EC2 instances → Systems Manager Run Command.**
    Logic: Run Command executes commands immediately across a fleet.
    **Remember:** Ad-hoc fleet command → Run Command. Scheduled patch process → Patch Manager/Maintenance Window.

51. **Run a task every morning, call an API, create HTML, email it → EventBridge + Lambda + SES.**
    Logic: EventBridge schedules, Lambda runs code, SES sends emails.
    **Remember:** Scheduled serverless job → EventBridge → Lambda.

52. **Application needs a normal shared file system that scales automatically across AZs → EFS.**
    Logic: S3 is object storage; EBS is block storage; EFS is shared NFS.
    **Remember:** Linux/shared file system → EFS.

53. **Records cannot be deleted by anyone, even root, for 10 years → S3 Object Lock Compliance Mode.**
    Logic: Compliance mode cannot be bypassed during retention.
    **Remember:**
    Governance = privileged users can bypass.
    Compliance = nobody can bypass.

54. **Windows SMB file shares need managed, Multi-AZ storage → FSx for Windows File Server.**
    Logic: It preserves Windows/SMB behavior.
    **Remember:** `Windows + SMB = FSx for Windows`.

55. **Only private application EC2 instances may access RDS → RDS security group allows source application security group.**
    Logic: Security groups can reference other security groups.
    **Remember:** App → DB access = SG-to-SG rule, not IP lists.

56. **Regional API Gateway uses custom HTTPS domain → ACM certificate must be in same Region.**
    Logic: Regional API endpoints use regional ACM certificates.
    **Important trap:** CloudFront certificates must be in **us-east-1**, but Regional API Gateway certificates go in the API Region.

57. **Detect inappropriate content in uploaded images → Amazon Rekognition.**
    Logic: Rekognition analyzes images/video. Comprehend analyzes text.
    **Remember:** Image AI → Rekognition.

58. **Run containers but do not want to manage servers → ECS on Fargate.**
    Logic: Fargate removes EC2 worker-node management.
    **Remember:** Containers without servers → Fargate.

59. **Very large real-time clickstream pipeline → Kinesis Data Streams → Firehose → S3 → Redshift.**
    Logic: Streams ingests, Firehose delivers, S3 stores, Redshift analyzes.
    **Remember the roles:**
    Kinesis Streams = real-time ingestion/consumers.
    Firehose = managed delivery.

60. **ALB should force all HTTP users to HTTPS → ALB listener redirect rule.**
    Logic: Redirect rather than simply blocking port 80.
    **Remember:** HTTP:80 listener → redirect → HTTPS:443.

61. **EC2 application uses RDS credentials and needs automatic rotation → Secrets Manager + EC2 IAM role.**
    Logic: Same core rule as Q11.
    **Remember:** If the exam says password + rotation, Secrets Manager should immediately come to mind.

62. **Certificate must come from an external CA → import certificate into ACM.**
    Logic: ACM-issued certificate would violate the external-CA requirement. Imported external certificates need replacement/expiration handling.
    **Remember:** External CA → Import into ACM.

63. **File uploaded to S3 must automatically be converted → S3 event → Lambda → S3.**
    Logic: Object upload is an event, so use event-driven serverless processing.
    **Remember:** S3 object processing → S3 event + Lambda.

64. **Windows file storage is moving to AWS, but on-prem users still need low latency → FSx for Windows + FSx File Gateway.**
    Logic: Cloud workloads use FSx directly; on-prem users use the gateway/cache.
    **Remember:** Hybrid Windows SMB → FSx File Gateway.

65. **PDF/JPEG medical reports need PHI detection → Textract + Comprehend Medical.**
    Logic: Textract reads text from documents; Comprehend Medical understands medical text and PHI.
    **Remember:**
    Document OCR → Textract.
    Medical text/PHI → Comprehend Medical.

---

## The patterns I want you to memorize

The questions change, but these mappings repeat constantly:

**S3 + SQL → Athena**
**S3 + PII → Macie**
**S3 + global static content → CloudFront**
**S3 private from VPC → Gateway Endpoint**
**S3 unpredictable access → Intelligent-Tiering**
**S3 permanent retention → Object Lock Compliance**

**EC2 accessing AWS → IAM Role**
**EC2 secure admin → Session Manager**
**EC2 fleet custom command → Run Command**
**Guaranteed EC2 capacity → Capacity Reservation**

**Password/credential rotation → Secrets Manager**

**Configuration/compliance → AWS Config**
**API activity → CloudTrail**
**Threat detection → GuardDuty**
**DDoS → Shield Advanced**
**Network traffic filtering → Network Firewall**
**Third-party firewall appliance → Gateway Load Balancer**

**One-to-many messaging → SNS + SQS**
**Reliable async processing → SQS**
**Strict ordering → SQS FIFO**

**Real-time streaming → Kinesis Data Streams**
**Managed stream delivery → Firehose**

**Linux shared files → EFS**
**Windows SMB → FSx for Windows**
**Hybrid Windows SMB → FSx File Gateway**

**Images → Rekognition**
**Document text extraction → Textract**
**Medical PHI → Comprehend Medical**

**Containers without managing servers → Fargate**

**Global UDP/TCP acceleration → Global Accelerator**
**Global HTTP/static caching → CloudFront**

If you can recall these rules quickly, a large number of SAA questions become much easier because you stop memorizing individual questions and start recognizing the **AWS pattern behind the question**.
