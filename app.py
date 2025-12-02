import os
import csv
import datetime
from io import BytesIO, StringIO
from functools import wraps

from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    flash,
    send_file,
    send_from_directory,
)
from flask_sqlalchemy import SQLAlchemy
from flask_login import (
    LoginManager,
    UserMixin,
    login_user,
    login_required,
    logout_user,
    current_user,
)
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import pandas as pd
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "data.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
PDF_FOLDER = os.path.join(BASE_DIR, "pdfs")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PDF_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config["SECRET_KEY"] = "dev-secret-key"
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

login_manager = LoginManager(app)
login_manager.login_view = "login"
db = SQLAlchemy(app)


# Models
class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user = db.Column(db.String(120))
    action = db.Column(db.String(200))
    details = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(50), nullable=False)

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    date = db.Column(db.String(100))
    season = db.Column(db.String(100))
    archived = db.Column(db.Boolean, default=False)


class Hall(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    number = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    archived = db.Column(db.Boolean, default=False)
    event = db.relationship("Event", backref=db.backref("halls", lazy=True))


class Booth(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hall_id = db.Column(db.Integer, db.ForeignKey("hall.id"), nullable=False)
    exhibitor = db.Column(db.String(200), nullable=False)
    booth_number = db.Column(db.String(50))
    contact = db.Column(db.String(200))
    archived = db.Column(db.Boolean, default=False)
    hall = db.relationship("Hall", backref=db.backref("booths", lazy=True))


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Float, default=0.0)
    description = db.Column(db.String(300))
    stock = db.Column(db.Integer, default=0)
    archived = db.Column(db.Boolean, default=False)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False)
    hall_id = db.Column(db.Integer, db.ForeignKey("hall.id"), nullable=False)
    booth_id = db.Column(db.Integer, db.ForeignKey("booth.id"), nullable=False)
    status = db.Column(db.String(50), default="Draft")
    total_net = db.Column(db.Float, default=0.0)
    total_vat = db.Column(db.Float, default=0.0)
    total_gross = db.Column(db.Float, default=0.0)
    pdf_path = db.Column(db.String(300))
    signed_document = db.Column(db.String(300))
    created_by = db.Column(db.String(80))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    event = db.relationship("Event")
    hall = db.relationship("Hall")
    booth = db.relationship("Booth")
    items = db.relationship("OrderItem", backref="order", lazy=True, cascade="all, delete-orphan")


class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    product = db.relationship("Product")


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# Helpers
ROLE_PERMISSIONS = {
    "admin": ["edit", "view", "stock", "orders", "import"],
    "seller": ["orders", "view"],
    "hall_manager": ["stock", "view"],
    "guest": ["view"],
}


def requires_role(*roles):
    def wrapper(func):
        @wraps(func)
        def decorated_view(*args, **kwargs):
            if not current_user.is_authenticated:
                return login_manager.unauthorized()
            if current_user.role not in roles:
                flash("Brak uprawnień do wykonania operacji", "danger")
                return redirect(url_for("dashboard"))
            return func(*args, **kwargs)

        return decorated_view

    return wrapper


def log_action(action: str, details: str = ""):
    username = current_user.username if current_user.is_authenticated else "system"
    entry = ActivityLog(user=username, action=action, details=details)
    db.session.add(entry)
    db.session.commit()


# Routes
@app.route("/")
def index():
    if current_user.is_authenticated:
        return redirect(url_for("dashboard"))
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            flash("Zalogowano pomyślnie", "success")
            return redirect(url_for("dashboard"))
        flash("Niepoprawne dane logowania", "danger")
    return render_template("login.html")


@app.route("/logout")
@login_required
def logout():
    logout_user()
    flash("Wylogowano", "info")
    return redirect(url_for("login"))


@app.route("/dashboard")
@login_required
def dashboard():
    events = Event.query.filter_by(archived=False).all()
    halls = Hall.query.filter_by(archived=False).all()
    booths = Booth.query.filter_by(archived=False).all()
    products = Product.query.filter_by(archived=False).all()
    orders = Order.query.order_by(Order.created_at.desc()).all()
    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(10).all()
    return render_template(
        "dashboard.html",
        events=events,
        halls=halls,
        booths=booths,
        products=products,
        orders=orders,
        logs=logs,
        can_import="import" in ROLE_PERMISSIONS.get(current_user.role, []),
        can_edit="edit" in ROLE_PERMISSIONS.get(current_user.role, []),
        can_stock="stock" in ROLE_PERMISSIONS.get(current_user.role, []),
        can_orders="orders" in ROLE_PERMISSIONS.get(current_user.role, []),
    )


@app.route("/events", methods=["POST"])
@login_required
@requires_role("admin")
def create_event():
    name = request.form.get("name")
    date = request.form.get("date")
    season = request.form.get("season")
    if name:
        event = Event(name=name, date=date, season=season)
        db.session.add(event)
        db.session.commit()
        log_action("Dodano wydarzenie", name)
    return redirect(url_for("dashboard"))


@app.route("/halls", methods=["POST"])
@login_required
@requires_role("admin")
def create_hall():
    event_id = request.form.get("event_id")
    number = request.form.get("number")
    description = request.form.get("description")
    if event_id and number:
        hall = Hall(event_id=event_id, number=number, description=description)
        db.session.add(hall)
        db.session.commit()
        log_action("Dodano halę", number)
    return redirect(url_for("dashboard"))


@app.route("/booths", methods=["POST"])
@login_required
@requires_role("admin")
def create_booth():
    hall_id = request.form.get("hall_id")
    exhibitor = request.form.get("exhibitor")
    booth_number = request.form.get("booth_number")
    contact = request.form.get("contact")
    if hall_id and exhibitor:
        booth = Booth(hall_id=hall_id, exhibitor=exhibitor, booth_number=booth_number, contact=contact)
        db.session.add(booth)
        db.session.commit()
        log_action("Dodano stoisko", exhibitor)
    return redirect(url_for("dashboard"))


@app.route("/products", methods=["POST"])
@login_required
@requires_role("admin")
def create_product():
    name = request.form.get("name")
    price = float(request.form.get("price") or 0)
    description = request.form.get("description")
    stock = int(request.form.get("stock") or 0)
    product = Product(name=name, price=price, description=description, stock=stock)
    db.session.add(product)
    db.session.commit()
    log_action("Dodano produkt", name)
    return redirect(url_for("dashboard"))


@app.route("/products/<int:product_id>/stock", methods=["POST"])
@login_required
@requires_role("admin", "hall_manager")
def update_stock(product_id):
    product = Product.query.get_or_404(product_id)
    stock = int(request.form.get("stock") or product.stock)
    product.stock = stock
    db.session.commit()
    log_action("Aktualizacja stanu", f"{product.name}: {stock}")
    flash("Zaktualizowano stan magazynowy", "success")
    return redirect(url_for("dashboard"))


@app.route("/orders/new", methods=["POST"])
@login_required
@requires_role("admin", "seller")
def create_order():
    event_id = int(request.form.get("event_id"))
    hall_id = int(request.form.get("hall_id"))
    booth_id = int(request.form.get("booth_id"))
    status = request.form.get("status", "Draft")

    order = Order(event_id=event_id, hall_id=hall_id, booth_id=booth_id, status=status, created_by=current_user.username)

    total_net = 0
    items_to_add = []
    for product in Product.query.filter_by(archived=False).all():
        qty_str = request.form.get(f"product_{product.id}")
        if not qty_str:
            continue
        qty = int(qty_str or 0)
        if qty <= 0:
            continue
        if qty > product.stock:
            flash(f"Brak wystarczającego stanu dla {product.name}", "danger")
            return redirect(url_for("dashboard"))
        line_total = qty * product.price
        total_net += line_total
        items_to_add.append((product, qty))

    vat = round(total_net * 0.23, 2)
    total_gross = round(total_net + vat, 2)

    order.total_net = round(total_net, 2)
    order.total_vat = vat
    order.total_gross = total_gross

    db.session.add(order)
    db.session.commit()

    for product, qty in items_to_add:
        item = OrderItem(order_id=order.id, product_id=product.id, quantity=qty, unit_price=product.price)
        db.session.add(item)
        if status in ["Offer", "Finalized"]:
            product.stock -= qty
    db.session.commit()

    log_action("Utworzono zamówienie", f"#{order.id} ({status})")

    if status == "Offer":
        _generate_pdf(order)
        flash("Oferta wygenerowana i zapisano PDF", "success")
    elif status == "Finalized":
        _generate_pdf(order)
        flash("Zamówienie sfinalizowane", "success")
    else:
        flash("Zapisano szkic zamówienia", "info")

    return redirect(url_for("dashboard"))


@app.route("/orders/<int:order_id>/pdf")
@login_required
@requires_role("admin", "seller")
def download_pdf(order_id):
    order = Order.query.get_or_404(order_id)
    if not order.pdf_path:
        _generate_pdf(order)
    return send_from_directory(PDF_FOLDER, os.path.basename(order.pdf_path), as_attachment=True)


@app.route("/orders/<int:order_id>/upload", methods=["POST"])
@login_required
@requires_role("admin", "seller")
def upload_signed(order_id):
    order = Order.query.get_or_404(order_id)
    file = request.files.get("signed_file")
    if file:
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)
        order.signed_document = save_path
        order.status = "Confirmed - awaiting fulfillment"
        db.session.commit()
        log_action("Potwierdzono zamówienie", f"#{order.id}")
        flash("Przesłano podpisany dokument", "success")
    return redirect(url_for("dashboard"))


@app.route("/import/<string:data_type>", methods=["POST"])
@login_required
@requires_role("admin")
def import_data(data_type):
    file = request.files.get("file")
    if not file:
        flash("Brak pliku do importu", "warning")
        return redirect(url_for("dashboard"))

    filename = secure_filename(file.filename)
    ext = os.path.splitext(filename)[1].lower()
    stream = BytesIO(file.read())

    if ext == ".csv":
        df = pd.read_csv(stream)
    else:
        df = pd.read_excel(stream)

    if data_type == "events":
        Event.query.delete()
        for _, row in df.iterrows():
            event = Event(name=row.get("nazwa") or row.get("name"), date=str(row.get("data")), season=str(row.get("sezon") or row.get("season")))
            db.session.add(event)
    elif data_type == "halls":
        Hall.query.delete()
        for _, row in df.iterrows():
            event_name = row.get("wydarzenie") or row.get("event")
            event = Event.query.filter_by(name=str(event_name)).first()
            if not event:
                continue
            hall = Hall(event_id=event.id, number=str(row.get("numer")), description=str(row.get("opis")))
            db.session.add(hall)
    elif data_type == "products":
        Product.query.delete()
        for _, row in df.iterrows():
            product = Product(
                name=row.get("nazwa") or row.get("name"),
                price=float(row.get("cena") or row.get("price") or 0),
                description=row.get("opis") or row.get("description"),
                stock=int(row.get("stan") or row.get("stock") or 0),
            )
            db.session.add(product)
    elif data_type == "booths":
        Booth.query.delete()
        for _, row in df.iterrows():
            hall_number = str(row.get("hala") or row.get("hall"))
            hall = Hall.query.filter_by(number=hall_number).first()
            if not hall:
                continue
            booth = Booth(
                hall_id=hall.id,
                exhibitor=row.get("wystawca") or row.get("exhibitor"),
                booth_number=str(row.get("numer") or row.get("booth_number")),
                contact=row.get("kontakt") or row.get("contact"),
            )
            db.session.add(booth)
    else:
        flash("Nieobsługiwany typ importu", "danger")
        return redirect(url_for("dashboard"))

    db.session.commit()
    log_action("Import danych", data_type)
    flash("Zakończono import danych", "success")
    return redirect(url_for("dashboard"))


@app.route("/export/orders")
@login_required
def export_orders():
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(["id", "event", "hall", "booth", "status", "net", "vat", "gross"])
    for order in Order.query.all():
        writer.writerow([
            order.id,
            order.event.name,
            order.hall.number,
            order.booth.exhibitor,
            order.status,
            order.total_net,
            order.total_vat,
            order.total_gross,
        ])
    return send_file(BytesIO(si.getvalue().encode("utf-8")), mimetype="text/csv", as_attachment=True, download_name="orders.csv")


@app.route("/export/stocks")
@login_required
def export_stocks():
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(["product", "stock"])
    for product in Product.query.all():
        writer.writerow([product.name, product.stock])
    return send_file(BytesIO(si.getvalue().encode("utf-8")), mimetype="text/csv", as_attachment=True, download_name="stocks.csv")


@app.route("/export/logs")
@login_required
@requires_role("admin")
def export_logs():
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(["user", "action", "details", "timestamp"])
    for log_entry in ActivityLog.query.order_by(ActivityLog.timestamp.desc()).all():
        writer.writerow([log_entry.user, log_entry.action, log_entry.details, log_entry.timestamp])
    return send_file(BytesIO(si.getvalue().encode("utf-8")), mimetype="text/csv", as_attachment=True, download_name="logs.csv")


def _generate_pdf(order: Order):
    pdf_filename = f"order_{order.id}.pdf"
    pdf_path = os.path.join(PDF_FOLDER, pdf_filename)
    doc = SimpleDocTemplate(pdf_path, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph(f"Oferta / Zamówienie #{order.id}", styles["Title"]))
    story.append(Paragraph(f"Wydarzenie: {order.event.name}", styles["Normal"]))
    story.append(Paragraph(f"Hala: {order.hall.number}", styles["Normal"]))
    story.append(Paragraph(f"Stoisko: {order.booth.exhibitor} ({order.booth.booth_number})", styles["Normal"]))
    story.append(Spacer(1, 12))

    data = [["Produkt", "Cena", "Ilość", "Suma netto"]]
    for item in order.items:
        data.append([item.product.name, f"{item.unit_price:.2f}", item.quantity, f"{item.quantity * item.unit_price:.2f}"])

    table = Table(data, colWidths=[220, 80, 80, 100])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
            ]
        )
    )

    story.append(table)
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Suma netto: {order.total_net:.2f} PLN", styles["Normal"]))
    story.append(Paragraph(f"VAT (23%): {order.total_vat:.2f} PLN", styles["Normal"]))
    story.append(Paragraph(f"Suma brutto: {order.total_gross:.2f} PLN", styles["Normal"]))
    story.append(Spacer(1, 24))
    story.append(Paragraph("Podpis: ____________________________", styles["Normal"]))

    doc.build(story)
    order.pdf_path = pdf_path
    order.status = "Offer" if order.status == "Draft" else order.status
    db.session.commit()
    log_action("Wygenerowano PDF", f"#{order.id}")


# CLI helpers
@app.cli.command("create-admin")
def create_admin():
    if User.query.filter_by(username="admin").first():
        print("Admin already exists")
        return
    admin = User(username="admin", role="admin")
    admin.set_password("admin")
    db.session.add(admin)
    db.session.commit()
    print("Created default admin (admin/admin)")


@app.before_first_request
def setup():
    db.create_all()
    if not User.query.filter_by(username="admin").first():
        admin = User(username="admin", role="admin")
        admin.set_password("admin")
        db.session.add(admin)
    if not User.query.filter_by(username="seller").first():
        seller = User(username="seller", role="seller")
        seller.set_password("seller")
        db.session.add(seller)
    if not User.query.filter_by(username="kierownik").first():
        manager = User(username="kierownik", role="hall_manager")
        manager.set_password("kierownik")
        db.session.add(manager)
    if not User.query.filter_by(username="guest").first():
        guest = User(username="guest", role="guest")
        guest.set_password("guest")
        db.session.add(guest)
    db.session.commit()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
