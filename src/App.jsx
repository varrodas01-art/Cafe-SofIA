import { useState, useMemo } from "react";
import { PRODUCTOS_INICIALES, CLIENTES, CUPONES_INICIALES, TIPOS_CLIENTE, HOY } from "./data.js";
import { IconCoffee, IconPlus, IconMinus, IconX, IconArrowLeft, IconCheck, IconCart } from "./icons.jsx";

// Paleta oficial Café SofIA (Costa Rica)
const BG = "#EFE7DA"; // fondo principal, crema papel
const CARD_BORDER = "#DBCBB7"; // crema arena
const TEXT = "#0D0D0B"; // negro tinta
const MUTED = "#2C2722"; // carbón, texto secundario
const PRIMARY = "#B78657"; // cobre, acento de marca
const COPPER_LIGHT = "#C1A689"; // cobre claro, texturas
const COPPER_DARK = "#A0764D"; // cobre tostado, profundidad/sombras
const EARTH = "#56493D"; // tierra café, transiciones
const WHITE = "#FBF8F2"; // crema muy clara para tarjetas sobre el fondo
const SUCCESS = "#4B6B4F";
const WARN = COPPER_DARK;

function fmtUsd(n) {
  return "$" + n.toFixed(2);
}

function ProductArt({ size = 64 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: `linear-gradient(135deg, ${COPPER_LIGHT}, ${CARD_BORDER})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <IconCoffee size={size * 0.45} color={PRIMARY} />
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("bienvenida");
  const [products, setProducts] = useState(PRODUCTOS_INICIALES);
  const [coupons, setCoupons] = useState(CUPONES_INICIALES);
  const [cart, setCart] = useState({});
  const [client, setClient] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [regForm, setRegForm] = useState({ nombre: "", apellido: "", correo: "", celular: "", pais: "", ciudad: "", tipo_cliente: "", consiente: false });
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState(null);
  const [stockNotice, setStockNotice] = useState(null);
  const [rejectedAttempts, setRejectedAttempts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [simulateId, setSimulateId] = useState("");

  const goto = (s) => {
    setStockNotice(null);
    setScreen(s);
  };

  function logRejected(product, qtySolicitada) {
    setRejectedAttempts((r) => [
      ...r,
      {
        id_intento: "int_" + (r.length + 1),
        fecha_hora: new Date().toISOString(),
        canal: "web",
        id_cliente: client && !client.guest ? client.id_cliente : "",
        tipo_cliente: client && !client.guest ? client.tipo_cliente : "Invitado",
        id_producto: product.id_producto,
        cantidad_solicitada: qtySolicitada,
        stock_disponible: product.stock,
        motivo: "stock_insuficiente",
      },
    ]);
  }

  function addToCart(id, deltaQty = 1) {
    const product = products.find((p) => p.id_producto === id);
    const current = cart[id] || 0;
    const requested = current + deltaQty;
    if (requested > product.stock) {
      logRejected(product, requested);
      setStockNotice({ type: "error", text: `Solo quedan ${product.stock} unidades de ${product.nombre}.` });
      return;
    }
    setCart((c) => ({ ...c, [id]: requested }));
  }

  function setCartQty(id, qty) {
    const product = products.find((p) => p.id_producto === id);
    if (qty > product.stock) {
      logRejected(product, qty);
      setStockNotice({ type: "error", text: `Solo quedan ${product.stock} unidades de ${product.nombre}.` });
      return;
    }
    setCart((c) => ({ ...c, [id]: Math.max(0, qty) }));
  }

  function removeFromCart(id) {
    setCart((c) => {
      const next = { ...c };
      delete next[id];
      return next;
    });
  }

  function simulateOutOfStock() {
    if (!simulateId) return;
    const product = products.find((p) => p.id_producto === simulateId);
    setProducts((ps) => ps.map((p) => (p.id_producto === simulateId ? { ...p, stock: 0 } : p)));
    if (cart[simulateId]) {
      removeFromCart(simulateId);
      setStockNotice({ type: "warn", text: `${product.nombre} se agotó justo ahora y se quitó de tu carrito.` });
    } else {
      setStockNotice({ type: "warn", text: `${product.nombre} se marcó como agotado (simulación de prototipo).` });
    }
  }

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ ...products.find((p) => p.id_producto === id), qty })),
    [cart, products]
  );

  const subtotal = cartItems.reduce((s, i) => s + i.precio_usd * i.qty, 0);
  const discount = couponMsg && couponMsg.ok ? subtotal * (couponMsg.percent / 100) : 0;
  const total = subtotal - discount;
  const totalUnits = cartItems.reduce((s, i) => s + i.qty, 0);

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    const found = coupons.find((c) => c.codigo === code);
    if (!found) {
      setCouponMsg({ ok: false, text: "Ese cupón no existe." });
      return;
    }
    if (found.usado) {
      setCouponMsg({ ok: false, text: "Ese cupón ya fue utilizado." });
      return;
    }
    if (new Date(found.fecha_vencimiento) < HOY) {
      setCouponMsg({ ok: false, text: "Ese cupón está vencido." });
      return;
    }
    setCouponMsg({ ok: true, text: `Cupón aplicado: ${found.porcentaje_descuento}% de descuento.`, percent: found.porcentaje_descuento, code });
  }

  function lookupEmail() {
    const found = CLIENTES.find((c) => c.correo.toLowerCase() === emailInput.trim().toLowerCase());
    if (found) {
      setClient(found);
      setEmailNotFound(false);
      goto("catalogo");
    } else {
      setEmailNotFound(true);
      setRegForm((f) => ({ ...f, correo: emailInput.trim() }));
    }
  }

  function submitRegistration() {
    if (!regForm.nombre || !regForm.apellido || !regForm.correo || !regForm.tipo_cliente || !regForm.consiente) return;
    setClient({ ...regForm, id_cliente: "nuevo_" + Date.now(), fecha_registro: "2026-09-16" });
    goto("catalogo");
  }

  function continueAsGuest() {
    setClient({ guest: true, tipo_cliente: "Invitado" });
    goto("catalogo");
  }

  function confirmOrder() {
    const id_pedido = "PED-" + (1000 + orders.length + 1);
    const nuevoPedido = {
      id_pedido,
      fecha_hora: new Date().toISOString(),
      canal: "web",
      id_cliente: client && !client.guest ? client.id_cliente : "",
      tipo_cliente: client ? client.tipo_cliente : "Invitado",
      subtotal_usd: subtotal,
      cupon: couponMsg && couponMsg.ok ? couponMsg.code : "",
      descuento_usd: discount,
      total_usd: total,
      estado: "confirmado",
    };
    const detalles = cartItems.map((i) => ({
      id_pedido,
      id_producto: i.id_producto,
      cantidad: i.qty,
      precio_unitario_usd: i.precio_usd,
    }));
    setProducts((ps) =>
      ps.map((p) => {
        const item = cartItems.find((i) => i.id_producto === p.id_producto);
        return item ? { ...p, stock: p.stock - item.qty, ventas_acumuladas: p.ventas_acumuladas + item.qty } : p;
      })
    );
    if (couponMsg && couponMsg.ok) {
      setCoupons((cs) => cs.map((c) => (c.codigo === couponMsg.code ? { ...c, usado: true } : c)));
    }
    setOrders((o) => [...o, nuevoPedido]);
    setOrderDetails((d) => [...d, ...detalles]);
    setLastOrder({ pedido: nuevoPedido, detalles, items: cartItems });
    setCart({});
    setCouponInput("");
    setCouponMsg(null);
    goto("confirmacion");
  }

  function newOrder() {
    setLastOrder(null);
    goto("catalogo");
  }

  const recommendation = useMemo(() => {
    const available = (id) => {
      const p = products.find((x) => x.id_producto === id);
      return p && p.stock > 0 ? p : null;
    };
    if (!client || client.guest) {
      const sorted = [...products].filter((p) => p.stock > 0).sort((a, b) => b.ventas_acumuladas - a.ventas_acumuladas);
      return sorted.length ? { product: sorted[0], label: "La más popular entre nuestros clientes" } : null;
    }
    if (client.tipo_cliente === "Estudiante ADEN") {
      const p = available("latte");
      return p ? { product: p, label: "Para estudiantes ADEN: nuestra opción más accesible" } : null;
    }
    if (client.tipo_cliente === "Colaborador ADEN") {
      const p = available("americano");
      return p ? { product: p, label: "Para colaboradores ADEN" } : null;
    }
    if (client.tipo_cliente === "Visitante") {
      const p = available("capuchino");
      return p ? { product: p, label: "La bebida emblema de la casa" } : null;
    }
    return null;
  }, [client, products]);

  const availableProducts = products.filter((p) => p.stock > 0);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'Lato', sans-serif", color: TEXT }}>
      {screen === "bienvenida" && (
        <main style={{ maxWidth: 440, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ margin: "0 auto 20px" }}>
            <ProductArt size={72} />
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 34, fontWeight: 600, margin: "0 0 8px", color: PRIMARY }}>Café CR</h1>
          <p style={{ fontSize: 15, color: MUTED, margin: "0 0 18px", lineHeight: 1.5 }}>
            El primer café del campus ADEN gestionado por inteligencia artificial.
          </p>
          <div style={{ background: WHITE, border: `1px solid ${COPPER_LIGHT}`, borderRadius: 12, padding: "10px 14px", fontSize: 12.5, color: MUTED, margin: "0 0 32px" }}>
            Este café es gestionado por IA: tu pedido, tiempos y stock se procesan automáticamente.
          </div>
          <button
            onClick={() => goto("identificacion")}
            style={{ background: PRIMARY, color: WHITE, border: "none", borderRadius: 999, padding: "14px 0", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}
          >
            Empezar pedido
          </button>
          <button
            onClick={() => goto("educacion_ia")}
            style={{ background: "transparent", color: MUTED, border: "none", fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}
          >
            ¿Cómo funciona la IA aquí?
          </button>
        </main>
      )}

      {screen === "educacion_ia" && (
        <main style={{ maxWidth: 440, margin: "0 auto", padding: "20px 20px 40px" }}>
          <TopBar onBack={() => goto("bienvenida")} title="Sobre la IA de este café" />

          <div style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px", color: PRIMARY }}>Qué hace bien la IA aquí</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
              <li>Recibe y organiza tu pedido al instante, sin filas ni esperas.</li>
              <li>Controla el stock en tiempo real, así no te ofrece algo que no hay.</li>
              <li>Te recomienda bebidas según tu perfil, no al azar.</li>
            </ul>
          </div>

          <div style={{ background: COPPER_LIGHT, border: `1px solid ${COPPER_DARK}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 6px", color: WARN }}>Sus límites (y por eso hay personas detrás)</p>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>
              <li>La IA puede equivocarse o quedarse sin respuesta ante algo inesperado; un miembro del equipo siempre puede intervenir.</li>
              <li>Nunca prepara ni toca tu bebida: eso lo hace la máquina automática y el personal en el mostrador.</li>
              <li>No decide sola: las reglas de precios, stock y promociones las define el equipo humano del café.</li>
              <li>Tus datos se usan solo para gestionar tu pedido, y solo si diste tu consentimiento.</li>
            </ul>
          </div>

          <div style={{ background: WHITE, border: `1px solid ${COPPER_LIGHT}`, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: MUTED, marginBottom: 20 }}>
            Si algo no te cuadra con tu pedido, siempre puedes hablar directamente con el personal en el mostrador.
          </div>

          <button onClick={() => goto("identificacion")} style={{ ...primaryBtn(), width: "100%" }}>
            Entendido, empezar pedido
          </button>
        </main>
      )}

      {screen === "identificacion" && (
        <main style={{ maxWidth: 440, margin: "0 auto", padding: "20px 20px 40px" }}>
          <TopBar onBack={() => goto("bienvenida")} title="¿Ya nos conoces?" />

          <p style={{ fontSize: 14, color: MUTED, margin: "0 0 16px" }}>
            Escribe tu correo para saludarte por tu nombre, o continúa como invitado.
          </p>

          <input
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              setEmailNotFound(false);
            }}
            placeholder="tu@correo.com (prueba: ana.perez@aden.edu)"
            style={inputStyle()}
          />
          <button onClick={lookupEmail} style={{ ...secondaryBtn(), width: "100%", margin: "10px 0 8px" }}>
            Continuar con este correo
          </button>

          {emailNotFound && (
            <div style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: 16, margin: "12px 0" }}>
              <p style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px" }}>No te encontramos. Registro rápido (opcional):</p>
              <FieldRow>
                <input placeholder="Nombre" value={regForm.nombre} onChange={(e) => setRegForm((f) => ({ ...f, nombre: e.target.value }))} style={inputStyle()} />
                <input placeholder="Apellido" value={regForm.apellido} onChange={(e) => setRegForm((f) => ({ ...f, apellido: e.target.value }))} style={inputStyle()} />
              </FieldRow>
              <input placeholder="Correo" value={regForm.correo} onChange={(e) => setRegForm((f) => ({ ...f, correo: e.target.value }))} style={{ ...inputStyle(), marginTop: 8 }} />
              <FieldRow style={{ marginTop: 8 }}>
                <input placeholder="Celular" value={regForm.celular} onChange={(e) => setRegForm((f) => ({ ...f, celular: e.target.value }))} style={inputStyle()} />
                <input placeholder="País" value={regForm.pais} onChange={(e) => setRegForm((f) => ({ ...f, pais: e.target.value }))} style={inputStyle()} />
              </FieldRow>
              <input placeholder="Ciudad" value={regForm.ciudad} onChange={(e) => setRegForm((f) => ({ ...f, ciudad: e.target.value }))} style={{ ...inputStyle(), marginTop: 8 }} />
              <select
                value={regForm.tipo_cliente}
                onChange={(e) => setRegForm((f) => ({ ...f, tipo_cliente: e.target.value }))}
                style={{ ...inputStyle(), marginTop: 8 }}
              >
                <option value="">Tipo de cliente</option>
                {TIPOS_CLIENTE.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: MUTED, margin: "12px 0" }}>
                <input type="checkbox" checked={regForm.consiente} onChange={(e) => setRegForm((f) => ({ ...f, consiente: e.target.checked }))} style={{ marginTop: 2 }} />
                <span>Doy mi consentimiento para que Café CR guarde mis datos con fines de gestión de pedidos. No se comparten con terceros.</span>
              </label>

              <button
                onClick={submitRegistration}
                disabled={!(regForm.nombre && regForm.apellido && regForm.correo && regForm.tipo_cliente && regForm.consiente)}
                style={{ ...primaryBtn(), width: "100%", opacity: regForm.nombre && regForm.apellido && regForm.correo && regForm.tipo_cliente && regForm.consiente ? 1 : 0.45 }}
              >
                Registrarme y continuar
              </button>
            </div>
          )}

          <div style={{ textAlign: "center", margin: "20px 0 4px", fontSize: 12, color: MUTED }}>— o —</div>
          <button onClick={continueAsGuest} style={{ ...ghostBtn(), width: "100%" }}>
            Continuar como invitado
          </button>
        </main>
      )}

      {screen === "catalogo" && (
        <main style={{ maxWidth: 440, margin: "0 auto", paddingBottom: totalUnits > 0 ? 100 : 30 }}>
          <TopBar onBack={() => goto("identificacion")} title={client && !client.guest ? `¡Hola, ${client.nombre}!` : "Nuestro café"} cartCount={totalUnits} onCart={() => goto("carrito")} />

          {stockNotice && (
            <div style={{ margin: "0 20px 12px", padding: "10px 14px", borderRadius: 10, fontSize: 13, background: stockNotice.type === "error" ? "#FDECEA" : COPPER_LIGHT, color: stockNotice.type === "error" ? "#B91C1C" : WARN }}>
              {stockNotice.text}
            </div>
          )}

          {recommendation && (
            <section style={{ padding: "0 20px 16px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: PRIMARY, margin: "0 0 8px", letterSpacing: 0.3 }}>Recomendado para ti</p>
              <div style={{ background: WHITE, border: `1px solid ${COPPER_LIGHT}`, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                <ProductArt size={52} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{recommendation.product.nombre}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{recommendation.label}</p>
                </div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{fmtUsd(recommendation.product.precio_usd)}</span>
              </div>
            </section>
          )}

          <section style={{ padding: "0 20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {availableProducts.map((p) => {
                const qty = cart[p.id_producto] || 0;
                const lowStock = p.stock <= 2;
                return (
                  <div key={p.id_producto} style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: 14, display: "flex", gap: 12 }}>
                    <ProductArt size={56} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, fontFamily: "'Fraunces', serif" }}>{p.nombre}</p>
                        <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: "nowrap" }}>{fmtUsd(p.precio_usd)}</span>
                      </div>
                      <p style={{ margin: "3px 0 0", fontSize: 12.5, color: MUTED, lineHeight: 1.4 }}>{p.descripcion}</p>
                      <p style={{ margin: "6px 0 0", fontSize: 10.5, color: COPPER_DARK }}>imagen provisional</p>
                      {lowStock && <p style={{ margin: "4px 0 0", fontSize: 11.5, color: WARN, fontWeight: 700 }}>¡Solo quedan {p.stock}!</p>}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                        {qty === 0 ? (
                          <button onClick={() => addToCart(p.id_producto, 1)} style={{ ...secondaryBtn(), padding: "7px 16px", fontSize: 13 }}>
                            Agregar
                          </button>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 10, background: BG, borderRadius: 999, padding: "5px 8px" }}>
                            <button onClick={() => setCartQty(p.id_producto, qty - 1)} style={iconBtn()}>
                              <IconMinus size={14} color={PRIMARY} />
                            </button>
                            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 12, textAlign: "center" }}>{qty}</span>
                            <button onClick={() => addToCart(p.id_producto, 1)} style={iconBtn()}>
                              <IconPlus size={14} color={PRIMARY} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={{ padding: "24px 20px 0" }}>
            <div style={{ border: `1px dashed ${CARD_BORDER}`, borderRadius: 12, padding: 12 }}>
              <p style={{ fontSize: 11, color: COPPER_DARK, margin: "0 0 8px" }}>Solo prototipo: simular que una bebida se agota</p>
              <div style={{ display: "flex", gap: 8 }}>
                <select value={simulateId} onChange={(e) => setSimulateId(e.target.value)} style={{ ...inputStyle(), flex: 1, fontSize: 12.5 }}>
                  <option value="">Elegí una bebida</option>
                  {availableProducts.map((p) => (
                    <option key={p.id_producto} value={p.id_producto}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
                <button onClick={simulateOutOfStock} style={{ ...ghostBtn(), padding: "8px 12px", fontSize: 12.5 }}>
                  Agotar
                </button>
              </div>
            </div>
          </section>

          {totalUnits > 0 && (
            <div style={{ position: "fixed", bottom: 16, left: 16, right: 16, maxWidth: 408, margin: "0 auto" }}>
              <button
                onClick={() => goto("carrito")}
                style={{ width: "100%", background: TEXT, color: WHITE, border: "none", borderRadius: 999, padding: "14px 18px", display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                <span>Ver carrito · {totalUnits}</span>
                <span>{fmtUsd(subtotal)}</span>
              </button>
            </div>
          )}
        </main>
      )}

      {screen === "carrito" && (
        <main style={{ maxWidth: 440, margin: "0 auto", padding: "20px 20px 40px" }}>
          <TopBar onBack={() => goto("catalogo")} title="Tu carrito" />

          {stockNotice && (
            <div style={{ margin: "0 0 12px", padding: "10px 14px", borderRadius: 10, fontSize: 13, background: stockNotice.type === "error" ? "#FDECEA" : COPPER_LIGHT, color: stockNotice.type === "error" ? "#B91C1C" : WARN }}>
              {stockNotice.text}
            </div>
          )}

          {cartItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: MUTED }}>
              <p style={{ fontSize: 14, margin: "0 0 16px" }}>Tu carrito está vacío.</p>
              <button onClick={() => goto("catalogo")} style={secondaryBtn()}>
                Ver el catálogo
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {cartItems.map((i) => (
                  <div key={i.id_producto} style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>{i.nombre}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>{fmtUsd(i.precio_usd)} c/u</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, borderRadius: 999, padding: "4px 8px" }}>
                      <button onClick={() => setCartQty(i.id_producto, i.qty - 1)} style={iconBtn()}>
                        <IconMinus size={13} color={PRIMARY} />
                      </button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 10, textAlign: "center" }}>{i.qty}</span>
                      <button onClick={() => addToCart(i.id_producto, 1)} style={iconBtn()}>
                        <IconPlus size={13} color={PRIMARY} />
                      </button>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 52, textAlign: "right" }}>{fmtUsd(i.precio_usd * i.qty)}</span>
                    <button onClick={() => removeFromCart(i.id_producto)} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 2 }}>
                      <IconX size={16} color={MUTED} />
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, margin: "0 0 6px" }}>Cupón de descuento</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Código (prueba: BIENVENIDA10)"
                    style={{ ...inputStyle(), flex: 1, textTransform: "uppercase" }}
                  />
                  <button onClick={applyCoupon} style={{ ...ghostBtn(), padding: "10px 16px" }}>
                    Aplicar
                  </button>
                </div>
                {couponMsg && <p style={{ fontSize: 12.5, margin: "6px 0 0", color: couponMsg.ok ? SUCCESS : "#B91C1C", fontWeight: 600 }}>{couponMsg.text}</p>}
              </div>

              <div style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
                <Row label="Subtotal" value={fmtUsd(subtotal)} />
                {discount > 0 && <Row label="Descuento" value={"−" + fmtUsd(discount)} color={SUCCESS} />}
                <div style={{ borderTop: `1px solid ${CARD_BORDER}`, marginTop: 8, paddingTop: 8 }}>
                  <Row label="Total" value={fmtUsd(total)} bold />
                </div>
              </div>

              <button onClick={() => goto("pago")} style={{ ...primaryBtn(), width: "100%" }}>
                Ir a pagar
              </button>
            </>
          )}
        </main>
      )}

      {screen === "pago" && (
        <main style={{ maxWidth: 440, margin: "0 auto", padding: "20px 20px 40px" }}>
          <TopBar onBack={() => goto("carrito")} title="Pago" />

          <div style={{ background: COPPER_LIGHT, border: `1px solid ${COPPER_DARK}`, borderRadius: 10, padding: "10px 14px", fontSize: 12.5, color: WARN, marginBottom: 18 }}>
            Pago simulado. No ingreses datos reales de tarjeta.
          </div>

          <div style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 14, padding: 16, marginBottom: 20 }}>
            <label style={labelStyle()}>Número de tarjeta</label>
            <input placeholder="4111 1111 1111 1111" style={inputStyle()} />
            <FieldRow style={{ marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle()}>Vencimiento</label>
                <input placeholder="MM/AA" style={inputStyle()} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle()}>CVV</label>
                <input placeholder="123" style={inputStyle()} />
              </div>
            </FieldRow>
            <label style={{ ...labelStyle(), marginTop: 10, display: "block" }}>Nombre en la tarjeta</label>
            <input placeholder="Como aparece en la tarjeta" style={inputStyle()} />
          </div>

          <div style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <Row label="Total a pagar" value={fmtUsd(total)} bold />
          </div>

          <button onClick={confirmOrder} style={{ ...primaryBtn(), width: "100%" }}>
            Pagar {fmtUsd(total)}
          </button>
        </main>
      )}

      {screen === "confirmacion" && lastOrder && (
        <main style={{ maxWidth: 440, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <IconCheck size={28} color={WHITE} />
          </div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>¡Pedido confirmado!</h2>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px" }}>Pedido {lastOrder.pedido.id_pedido}</p>

          <div style={{ background: WHITE, border: `1px solid ${CARD_BORDER}`, borderRadius: 12, padding: 14, marginBottom: 16, textAlign: "left" }}>
            {lastOrder.items.map((i) => (
              <div key={i.id_producto} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0" }}>
                <span style={{ color: MUTED }}>
                  {i.qty} × {i.nombre}
                </span>
                <span style={{ fontWeight: 600 }}>{fmtUsd(i.precio_usd * i.qty)}</span>
              </div>
            ))}
            <div style={{ borderTop: `1px solid ${CARD_BORDER}`, marginTop: 8, paddingTop: 8 }}>
              <Row label="Total pagado" value={fmtUsd(lastOrder.pedido.total_usd)} bold />
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: TEXT, background: WHITE, border: `1px solid ${COPPER_LIGHT}`, borderRadius: 10, padding: "10px 14px", marginBottom: 26 }}>
            Retira tu pedido en el mostrador presentando este número.
          </p>

          <button onClick={newOrder} style={{ ...ghostBtn(), width: "100%" }}>
            Hacer otro pedido
          </button>
        </main>
      )}
    </div>
  );
}

function TopBar({ onBack, title, cartCount, onCart }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 18px" }}>
      <button onClick={onBack} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4, display: "flex" }} aria-label="Volver">
        <IconArrowLeft size={20} color={TEXT} />
      </button>
      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 600, margin: 0, flex: 1, textAlign: "center" }}>{title}</h2>
      {onCart ? (
        <button onClick={onCart} style={{ border: "none", background: "transparent", cursor: "pointer", padding: 4, position: "relative", display: "flex" }} aria-label="Ver carrito">
          <IconCart size={20} color={TEXT} />
          {cartCount > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: PRIMARY, color: WHITE, fontSize: 10, fontWeight: 700, borderRadius: 999, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {cartCount}
            </span>
          )}
        </button>
      ) : (
        <div style={{ width: 20 }} />
      )}
    </div>
  );
}

function Row({ label, value, bold, color }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, color: color || TEXT, padding: "3px 0" }}>
      <span style={{ color: bold ? TEXT : MUTED }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function FieldRow({ children, style }) {
  return <div style={{ display: "flex", gap: 8, ...style }}>{children}</div>;
}

function inputStyle() {
  return {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 10,
    border: `1px solid ${CARD_BORDER}`,
    fontSize: 13.5,
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: WHITE,
    color: TEXT,
  };
}

function labelStyle() {
  return { fontSize: 11.5, color: MUTED, fontWeight: 700, display: "block", margin: "0 0 4px" };
}

function primaryBtn() {
  return { background: PRIMARY, color: WHITE, border: "none", borderRadius: 999, padding: "13px 0", fontSize: 14.5, fontWeight: 700, cursor: "pointer" };
}

function secondaryBtn() {
  return { background: TEXT, color: WHITE, border: "none", borderRadius: 999, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" };
}

function ghostBtn() {
  return { background: "transparent", color: PRIMARY, border: `1.5px solid ${PRIMARY}`, borderRadius: 999, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" };
}

function iconBtn() {
  return { border: "none", background: "transparent", cursor: "pointer", display: "flex", padding: 2 };
}
