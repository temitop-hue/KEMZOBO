CREATE TABLE `contact_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`subject` varchar(255),
	`message` text NOT NULL,
	`status` enum('new','read','replied') DEFAULT 'new',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`variantId` int NOT NULL,
	`quantityAvailable` int DEFAULT 0,
	`lowStockThreshold` int DEFAULT 10,
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`variantId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`variantName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`unitPrice` int NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`orderNumber` varchar(50) NOT NULL,
	`status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
	`paymentStatus` enum('unpaid','paid','refunded') DEFAULT 'unpaid',
	`subtotal` int NOT NULL,
	`deliveryFee` int DEFAULT 0,
	`tax` int DEFAULT 0,
	`total` int NOT NULL,
	`shippingAddress` json,
	`billingAddress` json,
	`stripePaymentIntentId` varchar(255),
	`stripeSessionId` varchar(255),
	`trackingNumber` varchar(255),
	`trackingCarrier` varchar(100),
	`deliveryMethod` enum('self','third_party') DEFAULT 'third_party',
	`customerEmail` varchar(320) NOT NULL,
	`notes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` int NOT NULL,
	`compareAtPrice` int,
	`sku` varchar(100),
	`weight` varchar(50),
	`isActive` int DEFAULT 1,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `product_variants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`imageUrl` text,
	`images` json,
	`category` enum('classic','tropical','spiced','seasonal') DEFAULT 'classic',
	`isActive` int DEFAULT 1,
	`isFeatured` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` text,
	`phone` varchar(50),
	`passwordHash` text,
	`role` enum('user','admin') DEFAULT 'user',
	`shippingAddress` json,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `wholesale_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`businessName` varchar(255) NOT NULL,
	`contactName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`businessType` enum('store','restaurant','event','distributor','other') DEFAULT 'other',
	`estimatedVolume` varchar(255),
	`message` text,
	`status` enum('new','contacted','negotiating','approved','declined') DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wholesale_requests_id` PRIMARY KEY(`id`)
);
