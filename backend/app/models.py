import sqlalchemy as sa
import sqlalchemy.orm as so
from app import db, login
from flask_login import UserMixin
from datetime import datetime, timezone
from time import time
from typing import Optional
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from flask import current_app

import csv
import io
from datetime import datetime

# prefferences
# id
# hobbies  (Thins you already do)
# interests (things you would like to do)
# backref to user

class Incident(db.Model):
    __tablename__ = 'incidents'
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    severity = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f"<Incident {self.id}: severity {self.severity} at ({self.latitude}, {self.longitude}) on {self.date}>"

    @classmethod
    def import_from_csv(cls, file_obj):

        """
        Import incidents from a CSV file.

        The CSV file should have the following columns:
          - latitude
          - longitude
          - severity
          - date (in 'YYYY-MM-DD HH:MM:SS' or 'YYYY-MM-DD' format)

        Args:
            file_obj: A file-like object containing the CSV data.

        Returns:
            int: The number of incidents imported.
        """
        # Convert the binary file stream to a text stream.
        stream = io.StringIO(file_obj.read().decode("utf-8"), newline=None)
        reader = csv.DictReader(stream)

        print("CSV Headers:", reader.fieldnames)


        incidents = []
        for row in reader:
            try:
                latitude = float(row['lat'])
                longitude = float(row['lng'])
                severity = int(row['crime_severity'])
                date_str = row['dispatch_date'].strip()

                # Try parsing the date as a full datetime first, then as a date-only.
                try:
                    date_val = datetime.strptime(date_str, '%Y-%m-%d %H:%M:%S')
                except ValueError:
                    date_val = datetime.strptime(date_str, '%Y-%m-%d')
            except Exception:
                # Skip rows with missing or invalid data.
                continue

            incident = cls(
                latitude=latitude,
                longitude=longitude,
                severity=severity,
                date=date_val
            )
            incidents.append(incident)

        db.session.bulk_save_objects(incidents)
        db.session.commit()
        return len(incidents)



class User(UserMixin, db.Model):
    id: so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(65), index=True, unique=True)
    email: so.Mapped[str] = so.mapped_column(sa.String(120), index=True, unique=True)
    password_hash: so.Mapped[Optional[str]] = so.mapped_column(sa.String(256))
    password_reset_token_used = db.Column(db.Boolean, default=False)
    # prefferences: so.WriteOnlyMapped["Perfs"] = so.relationship(
    #    back_populates="author"
    # )
    about_me: so.Mapped[Optional[str]] = so.mapped_column(sa.String(140))
    last_seen: so.Mapped[Optional[datetime]] = so.mapped_column(
        default=lambda: datetime.now(timezone.utc)
    )
    # location

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash or "", password)

    def get_reset_password_token(self, expires_in=600):
        return jwt.encode(
            {"reset_password": self.id, "exp": time() + expires_in},
            current_app.config["SECRET_KEY"],
            algorithm="HS256",
        )

    @staticmethod
    def verify_reset_password_token(token):
        try:
            id = jwt.decode(
                token, current_app.config["SECRET_KEY"], algorithms=["HS256"]
            )["reset_password"]
        except:
            return None
        user = db.session.get(User, id)
        if user and user.password_reset_token_used:
            return None
        return user

    def __repr__(self):
        return "<User {}>".format(self.username)


@login.user_loader
def load_user(id):
    return db.session.get(User, int(id))
