from database import SessionLocal, User, Score, save_game_score, fetch_leaderboard


db = SessionLocal()

try:
    print("1. Testing connection to PostgreSQL...")
    # Create or fetch a test user
    test_user = db.query(User).filter(User.username == "test_player").first()
    if not test_user:
        test_user = User(username="test_player", password_hash="dummyhash123")
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        print(f"   Created test user with ID: {test_user.id}")
    else:
        print(f"   Found existing user with ID: {test_user.id}")

    print("2. Testing score insertion...")
    saved_score = save_game_score(db, user_id=test_user.id, score_value=180)
    print(f"   Successfully saved score ID {saved_score.id} with value {saved_score.score}!")

    print("3. Testing leaderboard query...")
    leaderboard = fetch_leaderboard(db)
    print(f"   Leaderboard results: {leaderboard}")

    print("\nSUCCESS: Database connection and queries are working perfectly!")

except Exception as e:
    print(f"\nERROR: Something went wrong:\n{e}")

finally:
    db.close()
