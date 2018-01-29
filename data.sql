INSERT items (itemName, posterUserId,highestBidId) VALUES ("picture", 1, 4);
INSERT items (itemName, posterUserId,highestBidId) VALUES ("table", 1, 3);
INSERT items (itemName, posterUserId,highestBidId) VALUES ("chair", 2, 2);
INSERT items (itemName, posterUserId,highestBidId) VALUES ("lamp", 2, 1);

INSERT bids(itemId, biddingUserId, bid) VALUES (1,2,11);
INSERT bids(itemId, biddingUserId, bid) VALUES (2,2,17);
INSERT bids(itemId, biddingUserId, bid) VALUES (3,1,13);
INSERT bids(itemId, biddingUserId, bid) VALUES (4,1,9);

INSERT users (userName, password) VALUES ('user1', '111');
INSERT users (userName, password) VALUES ('user2', '222');
