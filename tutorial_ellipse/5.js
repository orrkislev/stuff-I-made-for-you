//: HTML
<h2 class="text-2xl font-semibold mb-4 text-indigo-600">5. Adding a Second Ellipse</h2>
<p class="mb-4">Two is better than one! We're adding a second, smaller ellipse in front of the first. It's not perfect yet, but it's starting to look like a simple 3D object. Can you see it?</p>
<div class="bg-white px-4 rounded-lg shadow-md text-xs">
    <h3 class="font-semibold text-lg mb-2 text-indigo-500">Code focus:</h3>
    <ul class="list-disc pl-5 space-y-2">
        <li><code class="bg-gray-200 px-1 rounded">translate(50, 0)</code>: Moves the drawing position for the second ellipse.</li>
        <li><code class="bg-gray-200 px-1 rounded">size = 80</code>: The second ellipse is slightly smaller.</li>
    </ul>
</div>

//: JS
noFill()

const dirVector = V(mouseX - width / 2, mouseY - height / 2)
const ang = dirVector.heading()
rotate(ang)

ratio = map(dirVector.mag(), 0, width / 2, 1, .2)
size = 100
ellipse(0, 0, size * ratio, size)

translate(50,0)
size = 80
ellipse(0, 0, size * ratio, size)