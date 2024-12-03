//:HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">9. The Aura: A Constellation of Glowing Ellipses</h2>
<p class="mb-4">For our grand finale, we're creating a cosmic dance of glowing ellipses! Multiple ellipses of different sizes move together, creating a mesmerizing aura. Move your mouse and watch your very own constellation come to life!</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">function drawTheCircle(size, zOffset)</code>: This function encapsulates our ellipse drawing logic.</li>
        <li>Multiple <code class="bg-gray-200 px-1 rounded">drawTheCircle()</code> calls: Each creates a different sized ellipse at a different depth.</li>
        <li><code class="bg-gray-200 px-1 rounded">translate(zOffset * (1 - ratio), 0)</code>: This line within the function creates the 3D effect for each ellipse.</li>
    </ul>
</div>
//:JS
background(0)
stroke(255, 255, 0)
noFill()

const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)
ratio = map(dirVector.mag(), 0, width / 2, 1, .2)

drawingContext.shadowColor = 'white'
const blurs = [80, 40, 20, 10, 10, 10]

function drawTheCircle(size, zOffset) {
    push()
    translate(zOffset * (1 - ratio), 0)
    for (const blur of blurs) {
        drawingContext.shadowBlur = blur
        ellipse(0, 0, size * ratio, size)
    }
    pop()
}


drawTheCircle(100, 0)
drawTheCircle(150, 20)
drawTheCircle(50, 40)
drawTheCircle(80, 60)
drawTheCircle(30, 80)
drawTheCircle(120, 100)
drawTheCircle(70, 120)

